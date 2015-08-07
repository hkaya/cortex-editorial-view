promise = require 'promise'
$       = require 'jquery'

CortexNet = window?.Cortex?.net


class EditorialFeed

  constructor: (@feedXml, opts) ->
    opts ?= {}
    @_requestThrottleMs = 1000
    @assetCacheTTL = 7 * 24 * 60 * 60 * 1000
    if opts.assetCacheTTL?
      @assetCacheTTL = opts.assetCacheTTL

    @feedCacheTTL = 24 * 60 * 60 * 1000
    if opts.feedCacheTTL?
      @feedCacheTTL = opts.feedCacheTTL

    @feedCachePeriod = 30 * 60 * 1000
    if opts.feedCachePeriod?
      @feedCachePeriod = opts.feedCachePeriod

    @imageIndex = 0
    @images = []

    setInterval(@fetch, @feedCachePeriod)
    @fetch()

  get: ->
    console.log "EditorialFeed will return one of the #{@images.length} images in #{@feedXml}"
    new promise (resolve, reject) =>
      image = @_selectImage()
      if image?
        resolve image
      else
        reject new Error("No editorial image found for feed #{@feedXml}")

  fetch: =>
    console.log "About to start a new Editorial Content fetch url = #{@feedXml}"
    new promise (resolve, reject) =>
      opts =
        cache:
          mode: 'refresh'
          ttl: @feedCacheTTL
        stripBom: true
        retry: 3

      if CortexNet?
        CortexNet.download @feedXml, opts, (
          (file) =>
            $.get(file, (
              (data) =>
                imageUrls = @_parse data
                if imageUrls? and imageUrls.length > 0
                  console.log "Replacing images #{@images.length} -> #{imageUrls.length}"
                  promises = (@_cache(url, i * @_requestThrottleMs) for url, i in imageUrls)
                  promise.all(promises)
                    .then (res) =>
                      @images = res
                    .catch (e) -> console.error e
                    .done()

                resolve()
              )
            ).fail((e) =>
              @images = []
              console.log "Failed to fetch local editorial feed. e=", e
              reject e
            )
        ), (
          (e) =>
            @images = []
            console.log "Failed to fetch remote editorial feed. e=", e
            reject e
        )
      else
        reject new Error("Cortex network is not available.")

  _parse: (data) ->
    xmlDoc = $.parseXML(data)
    xml = $(xmlDoc)
    items = xml.find('item')
    images = []
    for item in items
      item = $(item)
      img = item.find('media\\:content, content')
      url = img.attr('url')
      images.push url

    console.log "Feed parsed: Total images found: #{images.length}"
    images

  _selectImage: ->
    image = undefined
    if @images? and @images.length > 0
      if @imageIndex >= @images.length
        @imageIndex = 0

      image = @images[@imageIndex]
      @imageIndex = @imageIndex + 1

    image

  _cache: (image, wait=0) =>
    new promise (resolve, reject) =>
      if CortexNet?
        opts =
          cache:
            mode: 'normal'
            ttl: @assetCacheTTL
          stripBom: false
          retry: 3

        error = (e) ->
          console.log "Failed to cache image #{image}, err=", err
          reject err

        success = (path) ->
          console.log "Cached image #{image} => #{path}"
          resolve path

        fetch = ->
          CortexNet.download image, opts, success, error
        setTimeout fetch, wait
      else
        console.log "Cortex network is not available. "
        resolve image


module.exports = EditorialFeed

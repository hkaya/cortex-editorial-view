promise   = require 'promise'
$         = require 'jquery'

CortexNet = window?.Cortex?.net


class EditorialFeed

  constructor: (@feedXml, opts) ->
    opts ?= {}
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
    @_selectImage()

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
                  promises = (@_cache(url) for url in imageUrls)
                  promise.all(promises)
                    .then (res) => @images = res
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

  _cache: (image) ->
    new promise (resolve, reject) =>
      if CortexNet?
        opts =
          cache:
            mode: 'normal'
            ttl: @assetCacheTTL
          stripBom: false
          retry: 3
        CortexNet.download image, opts, (
          (path) =>
            console.log "Cached image #{image} => #{path}"
            resolve path
        ), (
          (err) =>
            console.log "Failed to cache image #{image}, err=", err
            reject err
        )
      else
        console.log "Cortex network is not available. "
        resolve image


module.exports = EditorialFeed

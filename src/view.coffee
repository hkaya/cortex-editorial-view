CortexView    = window?.Cortex?.view

EditorialFeed = require './feed'

class EditorialView
  constructor: (feedXml, opts) ->
    opts ?= {}

    @displayTime = 7500
    if opts.displayTime?
      @displayTime = opts.displayTime

    @feed = new EditorialFeed feedXml, opts

  run: ->
    onerror = (err) =>
      console.log "Failed to render editorial content: #{err?.message}"
      run = =>
        @run()
      setTimeout run, 1000

    image = @feed.get()
    if image?
      callbacks =
        error: onerror
        begin: =>
          @run()
      CortexView.submitView @constructor.name, @render(image), @displayTime, callbacks

  render: (img) ->
    """
    <div style="background: url(#{img}) no-repeat center center local;"
      class="editorial">
    </div>
    """

module.exports = EditorialView

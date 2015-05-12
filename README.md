# cortex-editorial-view

Simple view for Cortex apps to display editorial images from an XML feed.

## Usage
```coffeescript
{EditorialView} = require 'cortex-editorial-view'

view = new EditorialView 'http://example.com/feed.xml', opts
window.Cortex.view.register 'EditorialView'
view.run()
```

## Configuration options
- `displayTime`: View duration in milliseconds. Default is 7500 ms.
- `assetCacheTTL`: Editorail image cache duration in milliseconds. Default is 7 days.
- `feedCacheTTL`: XML feed cache duration in milliseconds. Default is 1 day.
- `feedCachePeriod`: View will try to refresh the XML feed every `feedCachePeriod` milliseconds. Default is 30 mins.

## Requirements
- Cortex Player v1.6+
- A feed similar to: http://kitchen.screenfeed.com/feed/VqZWjdNCD0WEx1C6gtYSSA?duration=15. Expects the feed to have RSS style `item` sections. Url attribute of `item::media:content` will be used as image sources. 

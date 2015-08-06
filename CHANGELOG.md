# cortex-editorial-view

### 2.0.0

* fetch and cache feed image assets when feed is fetched.  this makes the `get`
  method incompatible with earlier versions which returned a deferred.  now just
  returns a local path

document.observe("dom:loaded", function() {
  function handleRemoteLink(element) {
    // TODO: data-url support is going away, just use href
    var url    = element.readAttribute('data-url') || element.readAttribute('href');
    var method = element.readAttribute('data-method') || 'GET';

    new Ajax.Request(url, {
      method: method,
      asynchronous: true,
      evalScripts: true
    });
  }

  $(document.body).observe("click", function(event) {
    var element = event.findElement("a[data-remote=true]");
    if (element) handleRemoteLink(element);
  });
});

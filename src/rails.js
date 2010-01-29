document.observe("dom:loaded", function() {
  var Callbacks = {
    onLoading: function(element, request) {
      element.fire("ajax:loading", {request: request});
    },

    onLoaded: function(element, request) {
      element.fire("ajax:loaded", {request: request});
    },

    onInteractive: function(element, request) {
      element.fire("ajax:interactive", {request: request});
    },

    onComplete: function(element, request) {
      element.fire("ajax:complete", {request: request});
    },

    onSuccess: function(element, request) {
      element.fire("ajax:success", {request: request});
    },

    onFailure: function(element, request) {
      element.fire("ajax:failure", {request: request});
    }
  }

  function handleRemoteLink(element) {
    // TODO: data-url support is going away, just use href
    var url    = element.readAttribute('data-url') || element.readAttribute('href');
    var method = element.readAttribute('data-method') || 'GET';

    var event = element.fire("ajax:before");
    if (event.stopped) return false;

    new Ajax.Request(url, {
      method: method,
      asynchronous: true,
      evalScripts: true,

      onLoading: Callbacks.onLoading.curry(element),
      onLoaded: Callbacks.onLoaded.curry(element),
      onInteractive: Callbacks.onInteractive.curry(element),
      onComplete: Callbacks.onComplete.curry(element),
      onSuccess: Callbacks.onSuccess.curry(element),
      onFailure: Callbacks.onFailure.curry(element)
    });

    element.fire("ajax:after");
  }

  $(document.body).observe("click", function(event) {
    var element = event.findElement("a[data-remote=true]");
    if (element) {
      handleRemoteLink(element);
      event.stop();
    }
  });
});

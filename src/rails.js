(function() {
  function handleRemote(element) {
    var method, url, params;

    var event = element.fire("ajax:before");
    if (event.stopped) return false;

    if (element.tagName.toLowerCase() === 'form') {
      method = element.readAttribute('method') || 'post';
      url    = element.readAttribute('action');
      params = element.serialize();
    } else {
      method = element.readAttribute('data-method') || 'get';
      url    = element.readAttribute('href');
      params = {};
    }

    new Ajax.Request(url, {
      method: method,
      parameters: params,
      evalScripts: true,

      onLoading:     function(request) { element.fire("ajax:loading", {request: request}); },
      onLoaded:      function(request) { element.fire("ajax:loaded", {request: request}); },
      onInteractive: function(request) { element.fire("ajax:interactive", {request: request}); },
      onComplete:    function(request) { element.fire("ajax:complete", {request: request}); },
      onSuccess:     function(request) { element.fire("ajax:success", {request: request}); },
      onFailure:     function(request) { element.fire("ajax:failure", {request: request}); }
    });

    element.fire("ajax:after");
  }

  function handleMethod(element) {
    var method = element.readAttribute('data-method'),
        url = element.readAttribute('href'),
        csrf_param = $$('meta[name=csrf-param]')[0],
        csrf_token = $$('meta[name=csrf-token]')[0];

    var form = new Element('form', { method: "POST", action: url, style: "display: none;" });
    element.parentNode.insert(form);

    if (method !== 'post') {
      var field = new Element('input', { type: 'hidden', name: '_method', value: method });
      form.insert(field);
    }

    if (csrf_param) {
      var param = csrf_param.readAttribute('content'),
          token = csrf_token.readAttribute('content'),
          field = new Element('input', { type: 'hidden', name: param, value: token });
      form.insert(field);
    }

    form.submit();
  }


  document.on("click", "*[data-confirm]", function(event, element) {
    var message = element.readAttribute('data-confirm');
    if (!confirm(message)) event.stop();
  });

  document.on("click", "a[data-remote]", function(event, element) {
    if (event.stopped) return;
    handleRemote(element);
    event.stop();
  });

  document.on("click", "a[data-method]", function(event, element) {
    if (event.stopped) return;
    handleMethod(element);
    event.stop();
  });

  // TODO: Submit does not bubble in IE
  document.on("submit", function(event) {
    var element = event.findElement(),
        message = element.readAttribute('data-confirm');
    if (message && !confirm(message)) {
      event.stop();
      return false;
    }

    var inputs = element.select("input[type=submit][data-disable-with]");
    inputs.each(function(input) {
      input.disabled = true;
      input.writeAttribute('data-original-value', input.value);
      input.value = input.readAttribute('data-disable-with');
    });

    var element = event.findElement("form[data-remote]");
    if (element) {
      handleRemote(element);
      event.stop();
    }
  });

  document.on("ajax:after", "form", function(event, element) {
    var inputs = element.select("input[type=submit][disabled=true][data-disable-with]");
    inputs.each(function(input) {
      input.value = input.readAttribute('data-original-value');
      input.removeAttribute('data-original-value');
      input.disabled = false;
    });
  });
})();

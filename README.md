Unobtrusive scripting support for prototype.js
==============================================

This unobtrusive scripting support file is developed for the Ruby on Rails framework, but is not strictly tied to any specific backend. You can drop this into any application to:

- force confirmation dialogs for various actions;
- make non-GET requests from hyperlinks;
- make forms or hyperlinks submit data asynchronously with Ajax;
- have submit buttons become automatically disabled on form submit to prevent double-clicking.

These features are achieved by adding certain ["data" attributes][data] to your HTML markup. Full documentation of recognized attributes is below.

Requirements
------------

- [prototype.js 1.7 RC3][proto] or later;
- for Ruby on Rails only: `<%= csrf_meta_tag %>` in the HEAD of your main layout;
- HTML5 doctype (optional).

If you don't use HTML5, adding "data" attributes to your HTML4 or XHTML pages might make them fail [W3C markup validation][validator]. However, this shouldn't create any issues for web browsers or other user agents.

In Ruby on Rails 3, the `csrf_meta_tag` helper generates two meta tags containing values necessary for [cross-site request forgery protection][csrf] built into Rails. If you're using Rails 2, here is how to implement that helper:

    # app/helpers/application_helper.rb
    def csrf_meta_tag
      if protect_against_forgery?
        out = %(<meta name="csrf-param" content="%s"/>\n)
        out << %(<meta name="csrf-token" content="%s"/>)
        out % [ Rack::Utils.escape_html(request_forgery_protection_token),
                Rack::Utils.escape_html(form_authenticity_token) ]
      end
    end

Documentation
-------------

### "data-confirm": Confirmation dialogs for links and forms

    <form data-confirm="Are you sure you want to submit?">...</form>

The presence of this attribute indicates that activating a link or submitting a form should be intercepted so the user can be presented a JavaScript `confirm()` dialog containing the text that is the value of the attribute. If the user chooses to cancel, the action doesn't take place.

### "data-disable-with": Automatic disabling of submit buttons in forms

    <input type="submit" value="Save" data-disable-with="Saving...">

This attribute indicates that a submit button should get disabled while the form is submitting. This is to prevent accidental double-clicks from the user, which could result in duplicate HTTP requests that the backend may not detect as such. The value of the attribute is text that will become the new value of the button in its disabled state.

### "data-method": Links that result in POST, PUT, or DELETE requests

    <a href="..." data-method="delete" rel="nofollow">Delete this entry</a>

Activating hyperlinks (usually by clicking or tapping on them) always results in an HTTP GET request. However, if your application is [RESTful][], some links are in fact actions that change data on the server and must be performed with non-GET requests. This attribute allows marking up such links with an explicit method such as "post", "put" or "delete".

The way it works is that, when the link is activated, it constructs a hidden form in the document with the "action" attribute corresponding to "href" value of the link and the method corresponding to "data-method" value, and submits that form.

Note for non-Rails backends: because submitting forms with HTTP methods other than GET and POST isn't widely supported across browsers, all other HTTP methods are actually sent over POST with the intended method indicated in the "_method" parameter. Rails framework automatically detects and compensates for this.

### "data-remote": Make links and forms submit asynchronously with Ajax

    <form data-remote="true">...</form>

This attribute indicates that the link or form is to be submitted asynchronously; that is, without the page refreshing.

If the backend is configured to return snippets of JavaScript for these requests, those snippets will get executed on the page once requests are completed. This is regular prototype.js behavior, and can be used for modifying the document after an action has taken place.

Alternatively, you can handle the following custom events to hook into the lifecycle of the Ajax request.

#### Custom events fired during "data-remote" requests

- `ajax:before` (no memo, stoppable) — fires before the Ajax request is initiated. If you stop this event with `event.stop()` method, the Ajax request will never take place.
- `ajax:create` — right after the Ajax request object has been initialized, but before it is sent. Useful for adding custom request headers.
- `ajax:success` — after completion, if the HTTP response was success;
- `ajax:failure` — after completion, if the server returned an error;
- `ajax:complete` — after the request has been completed, no matter what outcome.

The [`Ajax.Response`][response] instance of the current request is accessible on each of these events except `ajax:before` through the `memo` property. The [`Ajax.Request`][ajax] instance is then accessible through the `request` property on the response object. To illustrate, an example event handler would look like:

    function(event) {
      var response = event.memo
      response.request       //=> Ajax.Request instance
      response.responseText  //=> text body of the response
      response.responseJSON  //=> data object in case of JSON responses
    }

#### Examples

When processing a request failed on the server, it might return the error message as HTML:

    document.on('ajax:failure', '#account_settings', function(event, container) {
      // insert the failure message inside the "#account_settings" element
      container.insert(event.memo.responseText)
    })

Set custom HTTP headers just for a specific type of forms:

    document.on('ajax:create', 'form.new_conversation', function(event) {
      var request = event.memo.request
      request.options.requestHeaders = {'Accept': 'text/html'}
    })

If the form has file uploads, they can't be serialized and sent with Ajax. This detects file uploads in forms marked with "data-remote", prevents the Ajax request and, instead, submits the form normally (synchronously). The same form *without* file uploads would still be sent asynchronously, with Ajax:

    document.on('ajax:before', 'form', function(e, form) {
      // detects if there are files for upload
      var hasFiles = form.select('input[type=file]').any(function(i){ return i.getValue() })
      if (hasFiles) {
        e.stop()       // prevent Ajax request, it won't work for files
        form.submit()  // submit the form as usual
      }
    })

[data]: http://dev.w3.org/html5/spec/elements.html#embedding-custom-non-visible-data-with-the-data-attributes "Embedding custom non-visible data with the data-* attributes"
[proto]: http://prototypejs.org/2010/10/12/prototype-1-7-rc3-support-for-ie9
[validator]: http://validator.w3.org/
[csrf]: http://api.rubyonrails.org/classes/ActionController/RequestForgeryProtection.html
[RESTful]: http://en.wikipedia.org/wiki/Representational_State_Transfer "Representational State Transfer"
[ajax]: http://prototypejs.github.com/doc/edge/ajax/Ajax/Request/
[response]: http://prototypejs.github.com/doc/edge/ajax/Ajax/Response/
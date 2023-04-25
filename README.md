# Pushbroom Collection Server

This is the server that collects Pushbroom events.

## How Does It Work

By default, Pushbroom does not collect any data. Including the client-side collection snippet on a page will _not_ start collecting data from the user. In order to collect events, you need to instrument your application. Pushbroom can't assume what you care about, or your business needs. Additionally, making these assumptions can only _interfere_ in helping find the signal your looking for.

In order to read and store _any_ data off of a users terminal, we require informed consent. In practice, this means that Pushbroom helps you inobtrusively allow users to opt-in to analysis and collection, and provides guidance surrounding privacy policy language.

In order to ethically collect data from the user, we need to collect the minimum possible amount of data we need, anonymized but still _deleteable_ if a user revokes consent. This means we take two approaches;

### Server-Side Events with Node

These events run _on your server_ and _must not_ read from clients HTTP request. That means that these events run like so:

```
pushbroom('Event Type', {
  ...data
})
```

These events do not get added to sessions, or get connected to each other. These are free-floating data points for raw statistical analysis. We can track things like page view this way, or form submissions:

```
pushbroom('Page Request', {
  url: "https://pushbroom.co/signup",
  responseTime: 10ms
})

// and later on
pushbroom('Signup')
```

Do not track personaly identifying information.

#### Wait I Don't have a Node Server

Until we write helpers in other languages, you can send your data directly to the HTTP endpoints for collections.

### Client-Side Events

Upon initialization, Pushbroom will start collecting events. None of these events will be sent to the server however, until the user provides informed consent. Once they do, they will be assigned a UUID, which will be attached to their client via `eTag` headers. The events will be sent to the collector, and going forward all future events will be associated with the same UUID.

Sending client-side events to the server can be done in two ways; html elements or JavaScript Events.

#### JavaScript Events

Loading Pushbroom will attach a global object to the window, allowing for firing the following event from any part of your application code:

```
pushbroom('Event Name', {
  'addtional': 'data',
  'context': 'values'
})
```

#### HTML Elements

Pushbroom will fire events when it finds HTML elements in the browser.

```
<!-- Fires on pageload with basic page data, included referrer -->
<pushbroom/>

<!-- Adds additional data to the page view -->
<pushbroom
  testGroup="a"
  additionalContext="whatever you want"
  moreContext="more key value pairs" />
```

You can also attach data attributes to nodes for collecting specific data events:

```
<form
  data-pushbroom|view="Newsletter Signup"
  data-pushbroom:key="Value">
  …
</form>

<button data-pushbroom|click="Cool Button">…</button>
```

The `data-pushbroom` attribute marks the node for collection.

The pipe `|` defines when the event should be fired. `view` when the node enters the viewport. `click` when the node is clicked upon. `submit` when a form is submitted. Others if I think of them.

The default value is the type of event. Adding additional `:key` adds additional context to the event. In terms of the JavaScript collections, the following are equivilant:

```
pushbroom('Newsletter Signup', {key: "Value"})

<form
  data-pushbroom|submit="Newsletter Signup"
  data-pushbroom:key="Value">
```

#### Informing the User

You can demonstrate _what_ data you collect with the following:

```
pushbroom.keys()
```

#### Revoking Consent

The following function will revoke consent for Pushbroom tracking, and delete all data associated with the user:

```
pushbroom.revoke()
```

This will delete all the events attached to the user id, and wipe the user ID from the `eTag` headers.


### Combining Client and Server-Side Tracking

Lets take the following scenario;

On page load, your server tracks a page request

```
pushbroom('Page Request', {
  url: "https://pushbroom.co/signup",
  responseTime: 10ms
})
```

If the current user is opted-in to analytics, the client side event is fired on page load:

```
<pushbroom />
```

The result will be _two_ events;

```
{
  type: "Page Request",
  url: "https://pushbroom.co/signup"
  responseTime: 10ms
},{
  type: "View",
  url: "https://pushbroom.co/signup"
}
```

Naturally, the server-side events will outnumber the client-side events, as we can safely assume some number of users will _not_ opt-in to tracking or otherwise allow Pushbroom to collect events from their session.

The _difference_ in these two event counts becomes your Sample Rate, and can be used to calculate statistical significance for other correlations, like test cohort and conversion rate.

















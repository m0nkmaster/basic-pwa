return caches.match(TEMPLATE_URL).then(template => {
    return template.blob().then(templateHtml => {
        return caches.match(DATA_URL).then(data => {
            return data.json().then(json => {

              var storyId = event.request.url.match(/[\d]{2,}/);

              // do something with your JSON
              var final = templateHtml.replace(/{{headline}}/g, json.stories[storyId[0]].headline);
              final = final.replace("{{body}}", json.stories[storyId[0]].body);
              return new Response(final, { "headers" : {"Content-Type" : "text/html" }});
              //return caches.match(TEMPLATE_URL);
            });
        });
    });
});

# fe-proxy

A simple proxy server that redirects to different urls.

## Arguments

```bash
--route='regex url'
--port=number
```

where `--route` is split on whitespace, and creates a regex of the first string and a url of the second string. If only a url is specified, it will match anything.

The application accepts multiple `--route` arguments, and executes them in the order they are passed.

## Example

```bash
node index \
    --route='^/settings/ http://localhost:8081' \
    --route='http://localhost:8080' \
    --port=8040
```

Would setup a server at port `8040` that redirects to `localhost:8081/settings/` when the url matches the regex `^/settings/` and redirect to `http://localhost:8080` otherwise.

| URL | Redirect |
| --- | --- |
|`localhost:8040/settings/` | `localhost:8081/settings/` |
|`localhost:8040/settings/abc` | `localhost:8081/settings/abc` |
|`localhost:8040/` | `localhost:8080/` |
|`localhost:8040/abc` | `localhost:8080/abc` |
|`localhost:8040/abc/settings` | `localhost:8080/abc/settings` |

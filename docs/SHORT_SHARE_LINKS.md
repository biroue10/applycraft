# Short Share Links

Short public links are active in the product through `/r/{id}` URLs. ApplyCraft
also retains private offline `/r#...` links that keep document data inside the
URL fragment and do not require server-side document storage.

Short links use the Worker endpoint `POST /api/share` and a Cloudflare KV
namespace.

Required binding:

```text
SHARES
```

The Worker also accepts `SHARE_KV` or the existing `AC_KV` binding as fallback
names, but production should bind the namespace as `SHARES`. Without one of
these bindings, `/api/share` returns a safe
`SHARE_STORAGE_UNAVAILABLE` response and no document content is stored.

The production Worker config declares the binding without an ID:

```json
{
  "kv_namespaces": [
    {
      "binding": "SHARES"
    }
  ]
}
```

Cloudflare's automatic resource provisioning creates and binds the namespace
during deployment. If automatic provisioning is unavailable for a deployment,
create the namespace with `npx wrangler kv namespace create SHARES`, then add
the returned ID to the binding. Keep `RATE_LIMIT_KV` bound separately when
available so share creation and AI endpoints use centralized rate limiting
across isolates.

Privacy behavior:

- Short links store a copy of the versioned share payload in KV.
- Links expire automatically through KV TTL.
- The raw delete token is returned only once to the creator; only its hash is
  stored.
- Current `/r#...` hash links still work and keep all document content in the URL
  fragment without uploading it.

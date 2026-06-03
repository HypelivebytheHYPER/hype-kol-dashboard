# Lark Attachments — How to Get & Use

Reference for working with Bitable attachment fields (images, videos, documents) in the HypeKOL dashboard.

---

## 1. Attachment Data Structure

When you read a record, an attachment field returns an array of objects:

```json
{
  "Attachment": [
    {
      "file_token": "boxcnzm3dPEcutYDPplx5iDak4b",
      "name": "Hawaii_1_15Retina_R.jpg",
      "size": 5069121,
      "tmp_url": "https://open.larksuite.com/open-apis/drive/v1/medias/batch_get_tmp_download_url?file_tokens=boxcnzm3dPEcutYDPplx5iDak4b",
      "type": "image/jpeg",
      "url": "https://open.larksuite.com/open-apis/drive/v1/medias/boxcnzm3dPEcutYDPplx5iDak4b/download"
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `file_token` | Unique identifier for the file. Use this for API calls. |
| `name` | Original filename |
| `size` | File size in bytes |
| `type` | MIME type (`image/jpeg`, `video/mp4`, etc.) |
| `url` | Single-file **download API endpoint** — requires auth headers. Not a direct CDN URL. |
| `tmp_url` | Points to `batch_get_tmp_download_url` API endpoint — not a direct file URL. |

**Important:** The `url` and `tmp_url` in the record response are **not the actual file content**. They are API endpoints that require auth. You must call the Drive API to get a real CDN URL.

---

## 2. How to Download Attachments (2-Step Flow)

Lark requires a 2-step process to get usable file URLs from attachment fields:

### Step 1 — Get file tokens from Bitable records

Call `List records` to read the attachment field. Each attachment object contains a `file_token`.

```typescript
const records = await fetchRecordsList(appToken, tableId);
const tokens = records.flatMap(r =>
  (r.fields["Media"] || []).map((a: any) => a.file_token)
);
// → ["JIwFb0tpuo...", "Kr99bsMMM...", ...]
```

### Step 2 — Resolve tokens to direct URLs

#### Option A: Batch Temporary Download URLs (Recommended for Lists)

Use when displaying many files (grids, galleries). Resolves multiple tokens in one call.

**Endpoint:**
```
GET /open-apis/drive/v1/medias/batch_get_tmp_download_url?file_tokens={token1},{token2}
```

**Response:**
```json
{
  "code": 0,
  "data": {
    "tmp_download_urls": [
      {
        "file_token": "boxcnzm3dPEcutYDPplx5iDak4b",
        "tmp_download_url": "https://internal-cdn.larksuite.com/..."
      }
    ]
  }
}
```

- Returns a **pre-signed CDN URL** valid for **24 hours**
- Rate limit: **5 QPS**
- The CDN URL itself requires **no auth headers**

**Code in this project:**
```typescript
// lib/lark-base.ts
const urlMap = await batchGetTempDownloadUrls([token1, token2, token3]);
// urlMap = { [token]: "https://cdn.larksuite.com/..." }
```

#### Option B: Download Media (Single File)

Use when you need actual file bytes (server-side processing, proxying).

**Endpoint:**
```
GET /open-apis/drive/v1/medias/{file_token}/download
```

**Headers:**
```
Authorization: Bearer {tenant_access_token}
```

**Response:** Binary file stream.

> **Note:** For Bitable attachments on advanced-permission bases, add `?extra=` with `bitablePerm` context. See Section 5 below.

---

## 3. How to Upload an Attachment

### Step 1 — Upload the file to Lark Drive

**Endpoint:**
```
POST /open-apis/drive/v1/medias/upload_all
```

**Body:** `multipart/form-data`
- `file_name`: original filename
- `parent_type`: `"bitable_image"` for images, `"bitable_file"` for other files
- `parent_node`: your base `app_token`
- `file`: binary file content

**Response:**
```json
{
  "code": 0,
  "data": {
    "file_token": "boxbcCFb2dBwMK9S8kDILk1tayh"
  }
}
```

**Upload limits:**
- Max **5 QPS**, **10,000 calls/day**
- No concurrent calls (error `1061045` if exceeded)
- Files **≤20MB**: use `upload_all`
- Files **>20MB** or unstable network: use chunked upload (`upload_prepare` → `upload_part` → `upload_finish`)

### Step 2 — Attach to a Bitable record

**Endpoint:**
```
POST /open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records
```

**Body:**
```json
{
  "fields": {
    "Attachment": [
      { "file_token": "boxbcCFb2dBwMK9S8kDILk1tayh" }
    ]
  }
}
```

---

## 4. Architecture in This Project

### Data Layer (`lib/lark-base.ts`)

| Function | Purpose |
|---|---|
| `attachments(fields, key)` | Extracts `LarkAttachment[]` from raw record fields |
| `buildMediaUrl(token, tableId)` | Builds a Cloudflare Worker proxy URL (stable, no expiry) |
| `batchGetTempDownloadUrls(tokens)` | Calls Lark Drive API to get 24h CDN URLs |

### Why We Use a Cloudflare Worker Proxy

Lark attachment URLs require authentication. The Cloudflare Worker (`lark-http-hype.hypelive.workers.dev`) handles auth on the server side and returns a stable, cacheable image URL. This lets us use `<img src="...">` and `<video src="...">` directly in the browser without exposing tokens.

```
Browser ---> Worker /api/image/{token}?tableId={id}
              |
              v
         Worker fetches from Lark Drive (server-side auth)
              |
              v
         Returns file bytes with Cache-Control headers
```

### Live Page Video Flow (`LIVE_MC_LIST`)

```
1. fetchRecordsList(TABLES.LIVE_MC_LIST)
        |
        v
2. recordToLiveMC(record) ---> reads "Media" attachment field
        |
        v
3. Collect all file_token values
        |
        v
4. batchGetTempDownloadUrls(tokens) ---> gets 24h CDN URLs
        |
        v
5. Inject urls into mc.videos
        |
        v
6. <video src={mc.videos[0].url}> rendered in MCCard / MCDetailPanel
```

---

## 5. Advanced Permissions Base (Critical)

If your Base has **advanced permissions** enabled, downloading media requires an additional `extra` query parameter:

```
GET /drive/v1/medias/{file_token}/download?extra={encoded_json}
```

The `extra` parameter must contain the Base permission context:

```json
{
  "bitablePerm": {
    "tableId": "tblO6OeNZxfabcef",
    "attachments": {
      "fld32zZi5I": {
        "rec0BuOHq": ["boxbcsQNT0JsmrztOnX530abcef"]
      }
    }
  }
}
```

- `tableId`: table where the attachment lives
- `attachments`: nested map of `{ fieldId: { recordId: [fileTokens] } }`
- Must be **JSON-serialized** then **URL-encoded**

> Your Cloudflare Worker proxy may handle this internally. If direct API calls fail with permission errors, check whether advanced permissions are enabled on the base.

## 6. Common Pitfalls

| Mistake | Fix |
|---|---|
| Using `attachment.url` (the `url` field) directly in `<img>` | It's an API endpoint, not a file URL. Requires auth. Resolve via `batchGetTempDownloadUrls()` or the Worker proxy. |
| Forgetting `tmp_url` expires in 24h | Re-fetch before rendering if cached longer than a day. |
| Reading wrong field name | Use the exact field name from Lark Base — verify via `List fields` API, don't guess. |
| Mixing up `file_token` and `record_id` | `file_token` identifies the file; `record_id` identifies the row. |
| Uploading >20MB with `upload_all` | Use chunked upload (`upload_prepare` → `upload_part` → `upload_finish`). |
| Missing `extra` on advanced-permission Base | Add `bitablePerm` with `tableId` + `attachments` map. |

---

## 7. API Reference Links

| Operation | Lark API Endpoint | Rate Limit |
|---|---|---|
| List records | `GET /bitable/v1/apps/{app_token}/tables/{table_id}/records` | 20/s |
| List fields | `GET /bitable/v1/apps/{app_token}/tables/{table_id}/fields` | 20/s |
| Batch temp URLs | `GET /drive/v1/medias/batch_get_tmp_download_url` | **5 QPS** |
| Download media | `GET /drive/v1/medias/{file_token}/download` | — |
| Upload media | `POST /drive/v1/medias/upload_all` | **5 QPS, 10K/day** |
| Create record | `POST /bitable/v1/apps/{app_token}/tables/{table_id}/records` | 20/s |
| Update record | `PUT /bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}` | 20/s |

## 8. New Helpers in `lib/lark-base.ts`

```typescript
// Fetch full schema for any table
const fields = await fetchTableFields(TABLES.LIVE_MC_LIST);
// → [{ field_id: "fldLG9G0o1", field_name: "Media", type: 17, ui_type: "Attachment" }, ...]
```

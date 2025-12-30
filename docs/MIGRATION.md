# Creator Migration Importer

Import content from OnlyFans, Fanvue, or other platforms into NovaFans.

## Features

- Import from ZIP files
- Import from remote URLs (MEGA, Google Drive) - TODO
- Map posts and media automatically
- Support for drip scheduling or immediate publishing
- Preserve captions and metadata

## Usage

### API Endpoint

```
POST /migration/import
Authorization: Bearer <creator-token>
Content-Type: multipart/form-data

Body:
  - files[]: ZIP file
  - source: "onlyfans" | "fanvue"
  - mappingStrategy: "drip" | "publish"
  - remoteUrl?: string (optional, for remote imports)
```

### Example

```bash
curl -X POST https://api.novafans.com/migration/import \
  -H "Authorization: Bearer <token>" \
  -F "files[]=@onlyfans-export.zip" \
  -F "source=onlyfans" \
  -F "mappingStrategy=drip"
```

## Supported Sources

### OnlyFans

Structure:
- Media files (images/videos)
- Caption files (`.txt` with same name as media)
- Organized by date or category

Mapping:
- One media file = one post
- Caption file = post body
- Date from filename or folder structure

### Fanvue

Similar structure to OnlyFans:
- Media files
- Metadata files
- Organized by date

## Mapping Strategies

### Drip Schedule

Posts are scheduled for future publication:
- First post: 1 day from now
- Subsequent posts: 1 day apart
- Status: `SCHEDULED`
- Creator can review and approve

### Publish Immediately

Posts are published right away:
- Status: `PUBLISHED`
- Visibility: `SUBSCRIBERS`
- Available immediately

## Process

1. **Upload ZIP or provide remote URL**
2. **Extract files** to temporary directory
3. **Scan for media files** (images, videos)
4. **Map files to posts** based on source structure
5. **Upload media** to storage (S3/Bunny/local)
6. **Create posts** in database
7. **Create post media** records
8. **Cleanup** temporary files

## File Structure

### OnlyFans Export

```
onlyfans-export.zip
├── 2024-01-15/
│   ├── photo1.jpg
│   ├── photo1.txt (caption)
│   ├── video1.mp4
│   └── video1.txt
├── 2024-01-16/
│   └── ...
```

### Fanvue Export

Similar structure, may include JSON metadata files.

## Limitations

- Maximum file size: 2GB
- Maximum files per import: 1000
- Supported formats: JPG, PNG, GIF, WEBP, MP4, WEBM, MOV
- Remote URL imports: TODO (MEGA, Google Drive)

## Error Handling

- Invalid ZIP: Returns error
- Unsupported files: Skipped with warning
- Missing captions: Post created without body
- Upload failures: Retried up to 3 times

## Security

- Only creators can import
- Files scanned for malware (TODO)
- CSAM hash scanning (TODO)
- Rate limiting: 1 import per hour per creator

## TODO

- [ ] MEGA download integration
- [ ] Google Drive download integration
- [ ] Dropbox support
- [ ] Better caption extraction
- [ ] Date parsing from filenames
- [ ] Category/tag detection
- [ ] Duplicate detection
- [ ] Progress tracking
- [ ] Import history



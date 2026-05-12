Config.Media = {
    Enabled = true,
    Provider = 'fivemanage', -- 'fivemanage' | 'lb-upload' | 'custom' | 'none'
    AllowPhotos = true,
    AllowVideos = false,
    AllowExternalUrls = false,
    MaxFileSizeMb = 10,
    -- Provider credentials are NEVER hardcoded here; set them via convars in server.cfg:
    --   set w2f_phone_fivemanage_api_key ""
    --   set w2f_phone_lb_upload_endpoint ""
    -- The media server module reads them through GetConvar at runtime only.
    ConvarKeys = {
        fivemanage = 'w2f_phone_fivemanage_api_key',
        lb_upload  = 'w2f_phone_lb_upload_endpoint',
        custom     = 'w2f_phone_custom_upload_endpoint',
    },
}

/** Explicit native Sidera public business, content, email and asset contract. */
export const authoredSettingKeys= ["site"];
export const nativeBaseSeedDataTables= ["options","ap_human_design_offers"];
export const nativeDynamicCollections: Record<string, { fields: { slug: string; type: string; required?: boolean }[] }> = {};
export const nativeSeedAssetAliases = [];
export const nativePrivateEmailSampleKeys = [
  "email",
  "message",
  "phone"
];
export const nativeEmailMappings= [["customerName","event_payload","customerName"],["siteUrl","generated_url","urls.site"],["supportFooter","business_setting","notificationSettings.supportFooter"]];
export const nativeEmailDisplayVariables = [];
export const nativeEmailDisplayMappings = [];
export const nativeGeneratedUrlMappings= ["site"];
export const nativeBaseSettingKeys= ["payment_preference","site"];
export const nativeEmailSampleValueTypes: Record<string,string> = {customerName:"string",siteUrl:"string",supportFooter:"string",email:"string",phone:"string",message:"string"};
export const nativeStaticAssets: { path: string; digest: string }[] = [{"path": "/images/product-lamp-hero.png", "digest": "ff6ca7d56d85b533e29ca794eb5a7820829b1fc863e5a64062486a6c304ebf98"}];
export const nativeStaticAssetPaths = nativeStaticAssets.map((asset) => asset.path);
export const nativeCollectionColumns: Record<string,string[]> = {
  "site_chrome": [
    "id",
    "slug",
    "status",
    "primary_byline_id",
    "created_at",
    "updated_at",
    "published_at",
    "scheduled_at",
    "deleted_at",
    "version",
    "live_revision_id",
    "draft_revision_id",
    "locale",
    "translation_group",
    "title",
    "brand_name",
    "nav_home",
    "footer_brand_name",
    "footer_about"
  ],
  "site_pages": [
    "id",
    "slug",
    "status",
    "primary_byline_id",
    "created_at",
    "updated_at",
    "published_at",
    "scheduled_at",
    "deleted_at",
    "version",
    "live_revision_id",
    "draft_revision_id",
    "locale",
    "translation_group",
    "title",
    "hero_kicker",
    "hero_title",
    "hero_body",
    "hero_subtext",
    "hero_side_note",
    "generator_title",
    "generator_body",
    "nine_centres_eyebrow",
    "nine_centres_title",
    "concepts_eyebrow",
    "concepts_title",
    "types_eyebrow",
    "types_title",
    "types_hint",
    "readings_eyebrow",
    "readings_title",
    "readings_note",
    "how_eyebrow",
    "how_title",
    "letters_eyebrow",
    "faq_eyebrow",
    "faq_title",
    "articles_eyebrow",
    "articles_title",
    "articles_view_all",
    "final_cta_title",
    "final_cta_button",
    "hero_primary_cta",
    "hero_secondary_cta",
    "feature_1_title",
    "feature_1_body",
    "feature_2_title",
    "feature_2_body",
    "feature_3_title",
    "feature_3_body",
    "footer_note",
    "not_found_title",
    "not_found_body",
    "not_found_cta",
    "seo_title",
    "seo_description",
    "seo_canonical_path",
    "seo_robots",
    "og_title",
    "og_description",
    "og_image",
    "og_image_alt",
    "twitter_card",
    "twitter_title",
    "twitter_description",
    "twitter_image"
  ]
};

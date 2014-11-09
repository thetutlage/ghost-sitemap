
Messages =
  config_not_found: "Unable to locate sitemapfile.json , run 'ghost-sitemap init' to create one now"
  ghost_config_not_found: "Unable to find ghost config file '%path%' , recheck and update your sitemapfile.json file"
  init: "Started creating sitemap....."
  fetching: "Fetching <%= type%> ...."
  fetched: "Converted <%= counts%> <%= type%> to xml"
  writing: "Writing <%= type%> to <%= file %> ..."
  not_found: "No <%= type %> found"
  written: "Done writing <%= file %>"
  building: "Building final sitemap..."
  alldone: "all sitemaps have been created"
  not_inside_root: "You are not inside the root directory of ghost"
  not_writable: "Unable to create sitemapfile.json"
  writable: "sitemapfile.json created with following config"

module.exports = Messages

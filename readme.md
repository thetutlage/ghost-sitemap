## Ghost Sitemap Generator

Ghost sitemap generator is robust npm module to create sitemaps for your ghost blog like a breeze.

I setup a ghost blog and realised there is no easy way to generate and publish sitemaps for your ghost blog. Bamm!

Ideally it shouldn't be that hard to generate one as ghost is minmal and focused blogging platform so i wrote one.


### Installation

```
  npm install -g ghost-sitemap
```

### Database supported

All db supported by ghost

### Features

* Generate posts , pages, tags and index sitemap
* Easy to configure using sitemapfile.json file
* Ping google and bing about your new sitemap

### Commands

Make sure you run all commands from the root of your ghost project

* **ghostSitemap init** - To generate config file
* **ghostSitemap generate** - To generate a series of sitemaps
* **ghostSitemap ping [arguments]** - To ping google and bing

### ghostSitemap init

it will create a configration file where you define ghost config paths as well as sitemap frequency and priority

### ghostSitemap generate

it will generate possibly 4 sitemaps depending upon data present in your ghost database.

Possible sitemaps

* posts.xml - If have published posts
* pages.xml - If have published pages
* tags.xml - If have available tags
* sitemap.xml - Paths to above 3 sitemaps

### ghostSitemap ping [arguments:(all),(google,bing)]

it will ping google , bing or both depending upon arguments based.

#### Example

* **ghostSitemap ping all** will ping google and bing
* **ghostSitemap ping google** will ping google
* **ghostSitemap ping bing** will ping bing
* **ghostSitemap ping google,bing** will ping google and bing


#### Init config file

![Init config file](http://i1117.photobucket.com/albums/k594/thetutlage/ScreenShot2014-11-09at85253pm_zps744ae7d2.png)

#### Generate sitemaps

![sitemap](http://i1117.photobucket.com/albums/k594/thetutlage/ScreenShot2014-11-09at85236pm_zps080efd9c.png)

#### Ping Google and Bing

![ping](http://i1117.photobucket.com/albums/k594/thetutlage/ScreenShot2014-11-09at111919pm_zpsbd11ad1c.png)


### Configuring ghost to serve sitemaps

By default ghost does not serve static files apart from one defined by ghost itself, which means your created sitemaps will not
be access by anyone as the directory they are save in is not public.


By making a minor change you can make it possible.

* Open **core/server/middleware/index.js**
* Scroll till you find below section

  ```javascript
      // Static assets
    blogApp.use('/shared', express['static'](path.join(corePath, '/shared'), {maxAge: utils.ONE_HOUR_MS}));
    blogApp.use('/content/images', storage.getStorage().serve());
    blogApp.use('/ghost/scripts', express['static'](path.join(corePath, '/built/scripts'), {maxAge: utils.ONE_YEAR_MS}));
    blogApp.use('/public', express['static'](path.join(corePath, '/built/public'), {maxAge: utils.ONE_YEAR_MS}));
    ```
* And below line after the above code
  ```javascript
      blogApp.use('/sitemap', express['static'](path.join(corePath, '../sitemap'), {maxAge: utils.ONE_HOUR_MS}));
  ```

  Make sure to change **/sitemap** to the directory path inside your **sitemapfile.json** file, **/sitemap** is the default path if you have not played with your config file.

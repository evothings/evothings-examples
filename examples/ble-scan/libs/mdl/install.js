  // Install library in application.
  // see main-window-func.js, addLibraryToApp

  // 0. Read the index file to manipulate it
  var indexPath = APP_SETTINGS.getIndexFileFullPath(path)
  var html = FILEUTIL.readFileSync(indexPath)
  var scriptPath = `libs/${lib}/${lib}.js`
  var cssPath = `libs/${lib}/${lib}.css`

  // 1. Remove any existing reference in index.html
  cher = CHEERIO.load(html, { xmlMode: false })
  var element = cher('script').filter(function(i, el) {
        return cher(this).attr('src') === scriptPath
  })
  if (element.length > 0) {
    element.remove()
  }
  var element = cher('link').filter(function(i, el) {
        return cher(this).attr('href') === cssPath
  })
  if (element.length > 0) {
    element.remove()
  }

  // 2. Add a reference in index.html right before </body>
  // Note that we can't use <script blabla /> - it will fail
  cher('body').append(`
  <link rel="stylesheet" href="${cssPath}">
  <script src="${scriptPath}"></script>
`)

  // 3. Write index.html file back to disk
  FILEUTIL.writeFileSync(indexPath, cher.html())
  LOGGER.log("Added " + lib + " to " + path)

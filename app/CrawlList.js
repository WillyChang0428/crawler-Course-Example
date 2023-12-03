const $ = require('./lib/jQuery.js')
const GetHTML = require('./lib/GetHTML.js')
const CrawlItem = require('./CrawlItem.js')

// =================================================================
// 工具
// 詳情請查詢：https://github.com/pulipulichen/crawler-Course-Example/blob/main/app/lib/Tools.js

const Tools = require('./lib/Tools.js')

// =================================================================
// @TODO 1. 指定要抓取的啟始網址
// 請對照此處網址，確保跟你的爬蟲目標一致
const START_BASE_URL = 'https://catweb.ncl.edu.tw/QandA'

// =================================================================

// =================================================================
// @TODO 2. 抓取下一頁列表的連結選取器
// 請修改此處以抓取正確的範圍。
let nextPageLinkSelector = '#block-system-main > div > div > div.item-list > ul > li.pager-next > a'

// =================================================================
// @TODO 3. 最多抓取頁數
// 設為-1表示全部抓取
let PAGES_LIMIT = 2

// =================================================================

let ParseTable = async (outputArray = [], page = 1, baseURL) => {
  if (!baseURL) {
    baseURL = START_BASE_URL
  }

  let html = await GetHTML(baseURL)
  
  let $html = $(html)

  // =================================================================
  // @TODO 4. 決定要抓取列表的選取器
  // 請修改此處以抓取正確的範圍。
  let tableSelector = '#block-system-main > div > div > div.view-content > table > tbody > tr'

  // =================================================================

  let trList = $html.find(tableSelector)
  for (let i = 0; i < trList.length; i++) {
    let eleTr = trList[i]
    eleTr = $(eleTr)

    let output = {}

    // =================================================================
    // @TODO 5. 取得下一層網頁的網址跟轉換成ID
    // 請修改此處以抓取正確的資訊。

    let itemURL = eleTr.find('td a[href]').attr('href')
    itemURL = Tools.ResolveFullURL(baseURL, itemURL)

    output['id'] = itemURL
    output['dc.identifier'] = itemURL

    // =================================================================
    // @TODO 6. 取得其他資訊
    // 請修改此處，以抓取表格對應的欄位。

    // 將問題保存到dc.title
    output['dc.title'] = eleTr.find('td:eq(1)').html()
    output['dc.title'] = Tools.StripHTMLTags(output['dc.title'])
    

    // 將日期保存到dc.date
    let date = eleTr.find('td:eq(2)').html()
    output['dc.date'] = Tools.DateToISOFormat(date)

    // 將提問人保存到dc.creator
    output['dc.creator'] = eleTr.find('td:eq(0)').html()
    // 搭配Python使用
    output['dc.language'] = await Tools.ShellSpawn(`python3 -c 'import locale; print(locale.getdefaultlocale())'`)

    // =================================================================
    // @TODO 7. 啟用抓取下一層網頁
    // 則移除註解「//」即可啟用
    // 請注意itemURL必須正確

    await CrawlItem(itemURL, output)

    // =================================================================
    
    outputArray.push(output)
  }

  let nextPageLink = $html.find(nextPageLinkSelector)
  if (nextPageLink.length > 0) {
    let nextPageURL = nextPageLink.attr('href')
    nextPageURL = Tools.ResolveFullURL(baseURL, nextPageURL)
    
    page++
    if (page <= PAGES_LIMIT && nextPageURL) {
      outputArray = await ParseTable(outputArray, page, nextPageURL)
    }
    
  }

  return outputArray
}

module.exports = ParseTable
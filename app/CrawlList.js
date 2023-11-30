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

let ParseTable = async (outputArray = [], baseURL) => {
  if (!baseURL) {
    baseURL = START_BASE_URL
  }

  let html = await GetHTML(baseURL)
  
  let $html = $(html)

  // =================================================================
  // @TODO 2. 決定要抓取列表的範圍
  // 請修改此處以抓取正確的範圍。
  let tableSelector = '#block-system-main > div > div > div.view-content > table > tbody > tr'

  // =================================================================

  let trList = $html.find(tableSelector)
  for (let i = 0; i < trList.length; i++) {
    let eleTr = trList[i]
    eleTr = $(eleTr)

    let output = {}

    // =================================================================
    // @TODO 3. 取得下一層網頁的網址跟轉換成ID
    // 請修改此處以抓取正確的資訊。

    let itemURL = eleTr.find('td a[href]').attr('href')
    itemURL = Tools.ResolveFullURL(baseURL, itemURL)

    output['id'] = itemURL
    output['dc.identifier'] = itemURL

    // =================================================================
    // @TODO 4. 取得其他資訊
    // 請修改此處，以抓取表格對應的欄位。

    // 將問題儲存到dc.title
    output['dc.title'] = eleTr.find('td:eq(1)').html()
    output['dc.title'] = Tools.StripHTMLTags(output['dc.title'])
    

    // 將日期儲存到dc.date
    let date = eleTr.find('td:eq(2)').html()
    output['dc.date'] = Tools.DateToISOFormat(date)

    // =================================================================
    // @TODO 5. 抓取下一層網頁
    // 如果需要使用，則移除註解「//」即可

    //await CrawlItem(itemURL, output)

    // =================================================================
    
    outputArray.push(output)
  }


  // =================================================================
  // @TODO 6. 抓取下一頁列表
  // 請修改此處以抓取正確的範圍。
  let nextPageLinkSelector = '#block-system-main > div > div > div.item-list > ul > li.pager-next > a'

  // =================================================================
  let nextPageLink = $html.find(nextPageLinkSelector)
  if (nextPageLink.length > 0) {
    let nextPageURL = nextPageLink[0].href
    nextPageURL = Tools.ResolveFullURL(nextPageURL)

    outputArray = await ParseTable(outputArray, nextPageURL)
  }

  return outputArray
}

module.exports = ParseTable
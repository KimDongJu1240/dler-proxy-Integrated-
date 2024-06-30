import axios from 'https://cdn.jsdelivr.net/npm/axios@1.3.5/+esm';
import cheerio from 'https://cdn.jsdelivr.net/npm/cheerio@1.0.0-rc.12/+esm';

// var cors_api_url = 'http://43.202.119.162/'; //for deploy
var cors_api_url = 'https://www.detailimagedown.com/proxy/'; //for local test

class GetInfo {
    constructor(inputURL) {
        this.inputURL = inputURL;
    }

    async getHTML() {
        console.log("getHTML");
        var html = await axios.get(cors_api_url + this.inputURL);
        var $ = cheerio.load(html.data, { xmlMode: true });
        console.log('cheerio');
        return $;
    }

    async getProductName(htmlData) {
        const $ = htmlData;
        const productName = $("#lInfoItemTitle").text();
        return productName;
    }

    async getImgSrc(htmlData) {
        const $ = htmlData;
        const thumbImageSrc = $("#lThumbImgWrap").find('img').attr('src');
        const $element = $("#lInfoView > .lInfoViewItemContents img");
        const imgList = [];
        const $checkNoticeImg = $('#lInfoView > .lInfoViewNoticeWrap .lInfoViewNoticeTd img');
        console.log($checkNoticeImg.length);

        if ($checkNoticeImg.length) {
            $checkNoticeImg.each((idx, node) => {
                const noticeImgSrc = $(node).attr('src');
                imgList.push({
                    type: `noticeImg`,
                    indexNum: idx,
                    src: cors_api_url + noticeImgSrc
                });
            });
        } else {
            console.log("Notice Img don't exist");
        }

        $element.each((idx, node) => {
            const detailImgSrc = $(node).attr('src');
            const parentData = $(node).parent().parent().parent().parent().attr('class');
            if (parentData == 'lInfoViewItemContents' || parentData === undefined) {
                console.log(`${detailImgSrc} => class name is {${parentData}}`);
                imgList.push({
                    type: `detailImg`,
                    indexNum: idx,
                    src: cors_api_url + detailImgSrc
                });
            }
        });

        imgList.unshift({
            type: 'thumbImg',
            indexNum: 1,
            src: cors_api_url + thumbImageSrc,
        });
        // console.log(`imgList = \n${JSON.stringify(imgList, null, 2)}`); for monitor
        return imgList;
    }
}

export { GetInfo };

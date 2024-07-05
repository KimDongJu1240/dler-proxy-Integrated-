import axios from 'https://cdn.jsdelivr.net/npm/axios@1.3.5/+esm';
import cheerio from 'https://cdn.jsdelivr.net/npm/cheerio@1.0.0-rc.12/+esm';

const node_server_url = 'https://detailimagedown.com/fetch-data'; 
const cors_api_url = 'https://detailimagedown.com/proxy/'; 

class GetInfo {
    constructor(inputURL) {
        this.inputURL = inputURL;
    }

    async getHTML() {
        // console.log("getHTML");
        const response = await axios.get(node_server_url, {
            params: { url: this.inputURL }
        });

        const $ = cheerio.load(response.data);
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

        // 바뀐 부분: lInfoViewItemContents 안의 contentsBuffer 내용 가져오기
        const textareaContent = $('#lInfoViewItemContents #contentsBuffer').val();
        const $$ = cheerio.load(textareaContent); // textarea 내용 파싱

        $$('img').each((idx, node) => {
            const detailImgSrc = $(node).attr('src');
            const parentData = $(node).parent().parent().parent().parent().attr('class');
            if (parentData == 'lInfoViewItemContents' || parentData === undefined) {
                console.log(`${detailImgSrc} => class name is {${parentData}}`);
                imgList.push({
                    type: 'detailImg',
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

        // console.log(`imgList = \n${JSON.stringify(imgList, null, 2)}`); // for monitor
        return imgList;
    }
}

export { GetInfo };

import { GetInfo } from "/function-domeggook.js"; 
import { useDownload } from "/zipImages.js"; 

var checkboxFileName = document.getElementById("checkbox-fileName");
var checkboxThumbImg = document.getElementById("checkbox-thumb");
var checkboxNoticeImg = document.getElementById("checkbox-noticeImg");
var inputFileName = document.getElementById("inputFileName");

/* 기본 설정 */
checkboxThumbImg.checked = true;
checkboxFileName.checked = true;
checkboxNoticeImg.checked = true;
inputFileName.style.backgroundColor = '#d0d0d0';
inputFileName.style.textDecoration = 'line-through';

let imgList = [];

document.getElementById("startBtn").addEventListener('click', async function getImg(){
    console.time();
    document.getElementById('imgDownBtn').style.display = 'none';
    document.getElementById('parsingLoader').style.display = 'none';
    document.getElementById('parsingLoader').style.display = 'inline-block';
    document.getElementById('downloadStatus').classList.add('hidden');

    let inputData = document.getElementById("inputUrlBox").value;
    const productCode = getNumInString(inputData);
    console.log(productCode);

    const inputURL = `https://domeggook.com/${productCode}`;
    console.log(`입력된 URL => ${inputURL}\n`);

    imgList = [];

    const webData = new GetInfo(inputURL);
    const $ = await webData.getHTML();
    console.log(`typeof = ${typeof $}`);
    console.log($);
    const productName = await webData.getProductName($);
    const newImgList = await webData.getImgSrc($);
    
    console.log(`제품명 = ${productName}`);
    
    imgList = newImgList;

    // 다운로드 버튼 클릭 이벤트 제거 및 새로운 이벤트 추가
    const downloadBtn = document.getElementById('imgDownBtn');
    const newDownloadBtn = downloadBtn.cloneNode(true);
    downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);

    newDownloadBtn.addEventListener('click', async function() {
        const thumbOption = checkboxThumbImg.checked;
        const noticeImgOption = checkboxNoticeImg.checked;

        const filteredImgList = imgList.filter(img => {
            if (img.type === 'thumbImg' && thumbOption) return true;
            if (img.type === 'noticeImg' && noticeImgOption) return true;
            if (img.type === 'detailImg') return true;
            return false;
        });

        document.getElementById('downloadStatus').textContent = '압축 중...';
        document.getElementById('downloadStatus').classList.remove('hidden');
        document.getElementById('downloadStatus').classList.remove('fade-out');
        await downZipFile(filteredImgList, productName);
    });

    document.getElementById('parsingLoader').style.display = 'none';
    newDownloadBtn.style.display = 'inline-block';
    console.timeEnd();
});

const downZipFile = async (imgList, productName) => {
    let zipName = '';
    if (checkboxFileName.checked == true) zipName = productName;
    else zipName = inputFileName.value;

    console.log(`zip 파일명 = ${zipName}`);

    const { handleZip } = useDownload();
    await handleZip(imgList, zipName);
    document.getElementById('downloadStatus').textContent = '다운로드 시작!';
    setTimeout(() => {
        document.getElementById('downloadStatus').classList.add('fade-out');
        setTimeout(() => {
            document.getElementById('downloadStatus').classList.add('hidden');
        }, 1000);
    }, 3000);
};


document.getElementById("inputUrlBox").addEventListener("input", function(e) {
    if (e.target.value == "") {
        document.getElementById('imgDownBtn').style.display = 'none';
        document.getElementById('parsingLoader').style.display = 'none';
        document.getElementById('downloadStatus').classList.add('hidden');
    }
});

checkboxFileName.addEventListener("change", function() {
    const target = inputFileName;

    if (this.checked) {
        target.style.backgroundColor = '#d0d0d0';
        target.style.textDecoration = 'line-through';
    } else {
        target.style.backgroundColor = '#F5F5F6';
        target.style.textDecoration = '';
    }
});

inputFileName.addEventListener("click", function(){
    checkboxFileName.checked = false;
    this.style.backgroundColor = '#F5F5F6';
    this.style.textDecoration = '';
});

function checkIfNum(data) {
    let checkIfNum = /^[0-9]+$/; 
    return checkIfNum.test(data);
}

function getNumInString(data) {
    let status = checkIfNum(data);
    let productCode = '';
    if (status == true) {
        productCode = data;
    } else {
        let startProductCode = data.substring(data.search('domeggook.com/') + 14);
        if (startProductCode.includes('?') == true) productCode = startProductCode.substring(0, startProductCode.indexOf('?'));
        else productCode = startProductCode;
    }
    return productCode;
}

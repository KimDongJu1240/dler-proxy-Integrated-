import jszip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

const useDownload = () => {
  async function handleZip(images, zipName) {
    const zip = new jszip();
    let extensionCheck = ''; 
    let fileExtension = ''; 
    let fileName = '';

    const confirmedImagesPromises = images.map(async (image, i) => {
      try {
        console.log(`imgNum = ${i}`);
        let response = await fetch(image.src);
        if (response.ok) {
          console.log(`num i = ${i} push complete`);
          return { ...image, blob: await response.blob() }; // 바뀐 부분: 이미지 객체와 블랍을 함께 반환
        } else {
          throw new Error(`can not find the img`);
        }
      } catch (err) {
        console.log(`num i = ${i} error, pass`);
        return null;
      }
    });

    const confirmedImagesResults = await Promise.all(confirmedImagesPromises);
    const confirmedImages = confirmedImagesResults.filter(result => result !== null);

    console.log('images = ', images);
    console.log('confirmedImages = ', confirmedImages.map(img => img.src));
    console.log(`failed to get {${images.length - confirmedImages.length}} images response from images[]`);

    confirmedImages.forEach((image, index) => {
      const cleanUrl = image.src.split('?')[0]; // 바뀐 부분: URL에서 불필요한 텍스트 제거

      extensionCheck = cleanUrl.split('/').pop();

      if (extensionCheck.split('.').length > 1) {
        fileExtension = '.' + extensionCheck.split('.').pop(); // 바뀐 부분: 올바른 확장자 추출
      } else {
        fileExtension = '.png';
      }

      switch(image.type) {
        case 'thumbImg':
          fileName = '대표사진' + fileExtension; // 바뀐 부분
          break;
        case 'noticeImg':
          fileName = `공급사 공지 사진 ${image.indexNum + 1}` + fileExtension; // 바뀐 부분
          break;
        case 'detailImg':
          fileName = `상세사진 ${image.indexNum + 1}` + fileExtension; // 바뀐 부분
          break;
        default:
          fileName = `이미지 ${index + 1}` + fileExtension;
          break;
      }
      
      console.log(fileName);
      zip.file(fileName, image.blob);
    });

    // Generate the zip file
    const zipData = await zip.generateAsync({
      type: "blob",
      streamFiles: true,
    });

    // Create a download link for the zip file
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(zipData);
    link.download = zipName;
    link.click();
  }

  return { handleZip };
};

export { useDownload };

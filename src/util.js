// 根据字节大小计算出合适的显示文本
export const computeSizeStr = (sizeObj) => {
    return sizeObj.gsize.toString().startsWith('0')
    ? sizeObj.msize.toString().startsWith('0')
      ? `${sizeObj.ksize.toFixed(2)} KB`
      : `${sizeObj.msize.toFixed(2)} MB`
    : `${sizeObj.gsize.toFixed(2)} GB`;
  };
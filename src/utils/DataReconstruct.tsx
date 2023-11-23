const TranslateTimeStampToDate = (timeStamp: bigint) => {
    const timestampAsNumber = Number(timeStamp);
    const date = new Date(timestampAsNumber);
    return date;
};

const TranslateTimeStampToDisplayString = (timeStamp: bigint) => {
    const now = new Date();
    const time = TranslateTimeStampToDate(timeStamp);

    const result =
        now.getFullYear() - time.getFullYear() > 0
            ? now.getFullYear() - time.getFullYear() + ' năm'
            : now.getMonth() - time.getMonth() > 0
            ? now.getMonth() - time.getMonth() + ' tháng'
            : now.getDate() - time.getDate() > 0
            ? now.getDate() - time.getDate() + ' ngày'
            : now.getHours() - time.getHours() > 0
            ? now.getHours() - time.getHours() + ' giờ'
            : now.getMinutes() - time.getMinutes() > 0
            ? now.getMinutes() - time.getMinutes() + ' phút'
            : now.getSeconds() - time.getSeconds() > 0
            ? now.getSeconds() - time.getSeconds() + ' giây'
            : 'now';

    return result;
};

export default { TranslateTimeStampToDate, TranslateTimeStampToDisplayString };

module.exports.exchangeDate =(date) => {
    return {
        formatDate: `ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`,
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        thu: () => {
            switch (date.getDay()) {
                case 0:
                    return 'Chủ nhật'
                case 1:
                    return 'Thứ hai'
                case 2:
                    return 'Thứ ba'
                case 3:
                    return 'Thứ tư'
                case 4:
                    return 'Thứ năm'
                case 5:
                    return 'Thứ sáu'
                case 6:
                    return 'Thứ bảy'
                default:
                    break;
            }
        }
    }
}
module.exports.exchangeDate =(date) => {
    return {
        formatDate: `Ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`,
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

module.exports.countTickets = (tickets) => {
    if(tickets.length == 0) {
        return {};
    }
    let tickets_type = [];
    let current = tickets[0].code;
    let count = 0;
    for(let i = 0; i < tickets.length; i++) {
        let num = (tickets[i].status == 'available') ? count + 1 : count;
        let quan = ''
        if(num > 0) {
            quan = `
            <div class='form-outline'>
                <input
                    style='width: 4rem; margin-left: 5px'
                    value='0'
                    type='number'
                    id='typeNumber'
                    class=''
                />

            </div>
        `
        }else if (num == 0) {
            quan = `<p style="color: crimson">Đã hết vé</p>`
        }

        let tik = {
            name: tickets[i].name,
            code: tickets[i].code,
            price: tickets[i].price.toLocaleString('vi-vn', { style: 'currency', currency: 'VND' }),
            quantity: num,
            quanHTML: quan
        }

        if(i == tickets.length - 1) {
            tickets_type.push(tik)
            break;
        }

        if(tickets[i+1].code != current) {
            tickets_type.push(tik)

            count = 0;
            current = tickets[i+1].code;
        }
        else {
            if(tickets[i].status == 'available')
                count++;
        }
        
    }
    return tickets_type;
}
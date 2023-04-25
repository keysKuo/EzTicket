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

module.exports.countTickets = (tickets) => {
    let tickets_type = [];
    let current = tickets[0].name;
    let count = 0;
    for(let i = 0; i < tickets.length; i++) {
        if(i == tickets.length - 1) {
            tickets_type.push({
                name: tickets[i].name,
                price: tickets[i].price.toLocaleString('vi-vn', { style: 'currency', currency: 'VND' }),
                quantity: (tickets[i].status == 'available') ? count + 1 : count
            })

            break;
        }

        if(tickets[i+1].name != current) {
            tickets_type.push({
                name: tickets[i].name,
                price: tickets[i].price.toLocaleString('vi-vn', { style: 'currency', currency: 'VND' }),
                quantity: (tickets[i].status == 'available') ? count + 1 : count
            })

            count = 0;
            current = tickets[i+1].name;
        }
        else {
            if(tickets[i].status == 'available')
                count++;
        }
        
    }
    return tickets_type;
}
$(".otps").keyup(function (e) {
    if (this.value.length == this.maxLength) {
      $(this).next('.otps').focus();
    }
    else if (this.value == '') {
        $(this).prev('.otps').focus();
    }
    
 });

 $(document).ready(function() {
    $('.otp-alert').hide();
    
    let itv = setInterval(function() {
        let second = parseInt($('.second').text());
        if(second == 0) {
            clearInterval(itv);
        }
        else {
            let new_second = (--second >= 10) ? second : '0' + second;
            if(new_second == 0) {
                $('.otp-alert').text(`OTP đã hết hạn, vui lòng nhấn "Gửi lại OTP" để yêu cầu mã mới.`).show();
                $('.otp-expiry').text("")
                $('.otp-expiry').append(`
                    <a style="color: #D864A9" href="#" >Gửi lại</a>
                `)
            }
            else {
                $('.second').text(new_second);

            }
        }
    },1000)

    
 })

 $('#btn-confirm-otp').click(function() {
    let otps = $('.otps');
    let code = '';
    for(let i = 0; i <  otps.length; i++) {
        code += $(otps[i]).val();
    }
    
    $.ajax({
        url: '/verify-login',
        method: 'POST',
        data: {
            code
        },
        success: function(result) {
            if(result.success) {
                window.location.href = '/';
            }
        },
        error: function(err) {
            $('.otp-alert').text("OTP không chính xác. Vui lòng kiểm tra lại.").show();
            
        }
    })
 })
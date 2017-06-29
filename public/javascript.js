let socket = io("192.168.1.113:4000")

const div = d3.select('#formApp').append('div').attr('id','content');
const svg = div.append('svg').attr('width',500).attr('height',600);

let boxSize = 60; // kích thước ô vuôg
let n = 8; //số lượng ô trên môt hàng
for(let i = 0; i < n ; i++){
    for(let j = 0; j < n ;j++ ){
        const box = svg.append('rect')
        .attr('x', i * boxSize)
        .attr('y', j * boxSize)
        .attr('width', boxSize)
        .attr('height', boxSize)
        .style('stroke','black')
        .attr("fill", "beige")
        .on('click',function(){
            let selected = d3.select(this);
            socket.emit("click-caro", {x: selected.attr('x'), y: selected.attr('y')})
        });
    }
}


socket.on('server-send-tb',function(){
    alert('có người đã đăng nhập với tên này rồi')
})

socket.on('server-send-tc',function(data){
    $('#nameApp').html(data)
    $('#formLogin').hide();
    $('#conten').show(1000);
})
socket.on('server-send-CoNguoiLogout',function(data){
    alert(data + ' đã thoát')
})
socket.on('server-send-message',function(data){
    $('textarea').append(data.un + ' : ' + data.nd + '\n')
})

socket.on('server-send-caro',function(data){
    let matrix = data.Board;
    let Cur_Row = parseInt(data.x);
    let Cur_Col = parseInt(data.y);
    let Value = parseInt(data.value);
    const tick = svg
        .append("text")
        .attr("x", parseInt(data.x))
        .attr("y", parseInt(data.y))
        .attr("text-anchor", "middle")
        .attr("dx", 60 / 2)
        .attr("dy", 60 / 2 + 8)
        .text(function () {
            console.log(data.nguoichoi)
            if (data.nguoichoi === 1) {
                return "X"
            }
            else if (data.nguoichoi === 0) {
                return "O"
            }
        })
        .style("font-weight", "bold")
        .style("font-size", "40px")
        .style("fill", function () {
            if (data.nguoichoi === 1) {
                return "000066"
            }
            else if (data.nguoichoi === 0) {
                return "FF0000"
            }
        })
})
socket.on("khong-cho-doi-thu-click-khi-thua",function () {
        $('#formApp').css('pointer-events', 'none');
    })
socket.on("phat-su-kien-thua",function () {
    const lost = svg
        .append("text")
        .attr("x",130)
        .attr("y",200)
        .text('Bạn đã thua cuộc')
        .style("fill","black")
        .style("font-size", "30px")
})
socket.on("phat-su-kien-thang",function () {
    const lost = svg
        .append("text")
        .attr("x",60)
        .attr("y",200)
        .text('Chúc mừng bạn đã chiến thắng')
        .style("fill","black")
        .style("font-size", "30px")  
})

$(document).ready(function(){
    $('#formLogin').show();
    $('#conten').hide();
    $('#sendUser').click(function(){
        socket.emit('client-send-user',$('#userName').val())
    })

    $('#btn').click(function(){
        socket.emit('client-send-chat',$('#a').val())
    })


    $('#btn-out').click(function(){
        socket.emit('logout')
        $('#formLogin').show(1000);
        $('#conten').hide(1000);
    })
});
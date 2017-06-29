const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const nunjucks = require('nunjucks');

// cấu hình nunjucks
nunjucks.configure('views', {
	autoescape: true,
	cache: false,
	express: app,
	watch: true
})

app.use(express.static("./public"))

app.engine('html', nunjucks.render)
app.set('view engine', 'html')


let arrUser = [];
let arrNguoiChoi =[];

Array.matrix = (n,init) => {
	let mat = [];
	for(let i = 0 ; i < n; i++){
		let a =[];
		for(let j = 0; j < n; j++ ){
			a[j] = init;
		}
		mat[i] = a;
	}
	return mat;
}
let Arr_Broad = Array.matrix( 8 , 0);

//Kiem tra thang thua khi nguoi choi danh nuoc moi tren ban co
//Kiểm tra theo phương ngang từ vị trí hiện tại đi sang trái và sang phải đếm xem có đủ 5 quân cùng giá trị thì trả về true
let Horizontal = (Mat , Cur_row , Cur_col , Value) => {
	// đi sang bên trái
	let count_left = 0;
	let count_right = 0;
	// đi sang bên trái so với vị trí hiện tại
	for (let i = Cur_col; i >= 0; i--){
		if(Mat[Cur_row][i] === Value){
			count_left++;
		}else{
			break;
		}
	}
	// đi sang bên phải so với vị trí hiện tại
	for (let j = Cur_col + 1; j < 8 ; j++){
		if(Mat[Cur_row][j] === Value){
			count_right++;
		}else{
			break;
		}
	}
	if(count_right + count_left >= 5){
		return 1;
	}
};
//Đếm số điểm theo phương thẳng đứng theo 2 hướng từ điểm hiên tại đi thẳng lên trên và đi xuống dưới nếu cả 2 phía trên và dưới
//tổng số ô cùng màu >=5 thì trả về giá trị true tức là chiến thắng
let Vertically = (Mat , Cur_row , Cur_col , Value) => {
	let count_up = 0;
    let count_down = 0;
	for (let h = Cur_row - 1; h >= 0; h--) {
        if (Mat[h][Cur_col] === Value) {
            count_up++;
        }
        else {
            break;
        }
    }

	for(let k = Cur_row; k < 8 ; k++ ){
		if(Mat[k][Cur_col] === Value){
			count_down++;
		}else{
			break;
		}
	}

	if ((count_up + count_down >= 5)) {
        return 1;
    }
};

//Kiểm tra theo phương đường chéo phụ
let Diagonal = (Mat, Cur_row, Cur_col, Value) => {
    //kiểm tra theo phương đường chéo phía trên bên phải so với vị trí quân hiện tại
    let count_right_up = 0;
    let count_left_down = 0;
    let temp1 = 0;
    let temp2 = 1;
    for (let i = Cur_row; i >= 0; i--) {
        if (Mat[i][Cur_col + temp1] === Value) {
            count_right_up++;
            temp1++;
        }
        else {
            break;
        }
    }
    //kiểm tra theo phương đường chéo phía dưới bên trái so với vị trí quân hiện tại
    for (let j = Cur_row + 1; j < 10; j++) {
        if (Mat[j][Cur_col - temp2] === Value) {
            count_left_down++;
            temp2++;
        }
        else {
            break;
        }
    }
    if (count_right_up + count_left_down >= 5) {
        return 1;
    }
};

//Kiểm tra theo phương đường chéo chính
let Diagonal_main = (Mat, Cur_row, Cur_col, Value) => {
    let count_right_down = 0;
    let count_left_up = 0;
    let temp1 = 0;
    let temp2 = 1;
    //Kiểm tra theo phương đường chéo chính phía trên bên trái so với vị trí quân hiện tại
    for (let i = Cur_row; i >= 0; i--) {
        if (Mat[i][Cur_col - temp1] === Value) {
            count_left_up++;
            temp1++;
        }
        else {
            break;
        }
    }
    //Kiểm tra theo phương đường chéo chính phía dưới bên phải so với vị trí quân hiện tại
    for (let j = Cur_row + 1; j < 10; j++) {
        if (Mat[j][Cur_col + temp2] === Value) {
            count_right_down++;
            temp2++;
        }
        else {
            break;
        }
    }
    if (count_right_down + count_left_up >= 5) {
        return 1
    }
};



io.on('connection',function(socket){
	socket.on('client-send-user',function(data){
		if(arrUser.indexOf(data) >= 0){
			socket.emit('server-send-tb')
		}else{
			arrUser.push(data)
			socket.userName = data
			socket.emit('server-send-tc',data)
		}
	})

	socket.on('logout',function(data){
		socket.broadcast.emit('server-send-CoNguoiLogout',socket.userName)
		arrUser.splice(arrUser.indexOf(socket.userName),1)
	})
	socket.on('client-send-chat',function(data){
		io.sockets.emit('server-send-message',{
			un:socket.userName,
			nd:data
		})
	})
	socket.on("click-caro", function (data) {
        let vitri = arrUser.indexOf(socket.userName)
        let Columb = data.x / 60;
        let Row = data.y / 60;
        //Kiem tra khong cho nguoi choi gui du lieu 2 lan lien tuc len server
        if (socket.userName !== arrNguoiChoi[0]) {
            arrNguoiChoi.unshift(socket.userName);
            if (vitri === 0) {
                if (Arr_Broad[Row][Columb] === 0) {
                    Arr_Broad[Row][Columb] = 1;
                    io.sockets.emit("server-send-caro", {
                        name: socket.userName,
                        x: data.x,
                        y: data.y,
                        nguoichoi: vitri,
                        ArrId: arrNguoiChoi,
                        Board: Arr_Broad,
                        value: 1
                    })
					if(Horizontal(Arr_Broad, Row, Columb, 1) || Vertically(Arr_Broad, Row, Columb, 1) ||
                    Diagonal(Arr_Broad, Row, Columb, 1) || Diagonal_main(Arr_Broad, Row, Columb, 1)){
                        socket.broadcast.emit("khong-cho-doi-thu-click-khi-thua");
                        socket.broadcast.emit("phat-su-kien-thua");
                        socket.emit("phat-su-kien-thang")
                    }
          		}
			}else {
                if (Arr_Broad[Row][Columb] === 0) {
                    Arr_Broad[Row][Columb] = 2;
                    io.sockets.emit("server-send-caro", {
                        name: socket.userName,
                        x: data.x,
                        y: data.y,
                        nguoichoi: vitri,
                        ArrId: arrNguoiChoi,
                        Board: Arr_Broad,
                        value: 2
                    })
                    if(Horizontal(Arr_Broad, Row, Columb, 2) || Vertically(Arr_Broad, Row, Columb, 2) ||
                        Diagonal(Arr_Broad, Row, Columb, 2) || Diagonal_main(Arr_Broad, Row, Columb, 2)){
                        socket.broadcast.emit("khong-cho-doi-thu-click-khi-thua");
                        socket.broadcast.emit("phat-su-kien-thua");
                        socket.emit("phat-su-kien-thang")
                    }
                }
            }
		}
	})
})
		

app.get('/', (req,res) => {
	res.render('index.html')
})

server.listen(4000, function(){
    console.log('Web app listens at port 192.168.1.113:4000')
})
/* 
* カード1枚の情報を管理するクラス
* カードのマークと数字(1~13)をセットで扱う
*/
class Card {
    /* マークと数字を引数として受け取る */
    constructor(mark, no) {
        this.mark = mark;
        this.no = no;
    }
    /* マーク(String)を取得する */
    getStrMark() {
        return this.mark;
    }
    /* 数字(String)を取得する */
    getStrNo() {
        let no;
        switch (this.no) {
            case 11:
                no = "J";
                break;
            case 12:
                no = "Q";
                break;
            case 13:
                no = "K";
                break;
            default:
                no = String(this.no);
                break;
        }
        return no;
    }
    /* マーク+数字(String)を取得する */
    getStrName() {
        return this.mark + "の" + this.getStrNo();
    }
    /* 点数計算に使用するカードの得点を取得する */
    getIntPoint() {
        let point;
        /* J(10)、Q(12)、K(13)は10点として扱う。1~9は数字通りの点数。 */
        if ((this.no == 11) || (this.no == 12) || (this.no == 13)) {
            point = 10;
        }
        else {
            point = this.no;
        }
        return point;
    }
}

/*
* デッキの情報を管理するクラス
* デッキ内のカードはすべてカードクラス
*/
class Deck {
    /* デッキを作成する */
    createDeck() {
        this.deck = [];
        const mark = ["ダイヤ", "クラブ", "ハート", "スペード"];
        const no = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
        for (let i of mark) {
            for (let j of no) {
                let card = new Card(i, j);
                this.deck.push(card);
            }
        }
        // デッキのシャッフル
        for (let i = this.deck.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    /* デッキからカードを1枚引く */
    /* 引いたカードはデッキから消える */
    drawCard() {
        return this.deck.pop();
    }
}

/*
* ユーザー、ディーラーのベースとなるプレイヤークラス
*/
class Player {
    /* デッキクラスのインスタンスを引数として受け取る */
    constructor(deck){
        this.deck = deck;
        this.hand = [];
        /* 最初の手札としてデッキからカードを2枚引く */
        for (let i = 0; i < 2; i++) {
            this.hand.push(this.deck.drawCard());
        }
    }
    /* 手札の合計得点(Int)を取得する */
    getIntPoint() {
        let point = 0;
        for (let card of this.hand) {
            point = point + card.getIntPoint();
        }
        return point;
    }
    /* 
    * 手札の合計得点(String)を取得する
    * 合計得点が21点を超えている場合は点数の後ろに「バースト」と表示する
    */
    getStrPoint() {
        let point = this.getIntPoint();
        let str = String(point);
        if (point > 21) {
            str = str + "(バースト)";
        }
        return str;
    }
    /* 手札の合計得点が21点を超えているか判定する */
    isBurst() {
        let point = this.getIntPoint();
        if (point > 21) {
            return true;
        }
        else {
            return false;
        }
    }
}

/*
* ユーザークラス
*/
class User extends Player {
    constructor (deck) {
        super(deck);
        this.name = "ユーザー";
    }
    /* 手札と合計得点を表示する */
    printHand() {
        console.log("[" + this.name + "の手札]");
        for (let card of this.hand) {
            console.log(card.getStrName());
        }
        console.log("点数：" + this.getStrPoint());
        splitLine();
        return;
    }
    /*
    * ユーザーがデッキからカードを引く
    * カードを引くかどうかをコンソールからの入力で決定する
    */
    async drawCard() {
        let card = new Card();
        let isTurnEnd = new Boolean();
        let question = "カードを引きますか？(y/n) ";
        while (1) {
            this.printHand();
            let input = await readUserInput(question);
            if (input == "y") {
                card = this.deck.drawCard();
                console.log("引いたカード：" + card.getStrName());
                splitLine();
                this.hand.push(card);
                if (this.getIntPoint() >= 21) {
                    this.printHand();
                    isTurnEnd = true;
                }
                else {
                    isTurnEnd = false;
                }
            }
            else if (input == "n") {
                splitLine();
                isTurnEnd = true;
            }
            else {
                console.log("y,n以外が入力されました。再入力してください。");
            }
            if (isTurnEnd) {
                break;
            }
        }
        return;
    }
}

/*
* ディーラークラス
*/
class Dealer extends Player {
    constructor (deck) {
        super(deck);
        this.name = "ディーラー";
    }
    /*
    * ディーラーの手札を表示する
    * 手札を1枚隠して表示するか、全ての手札+合計得点を表示するか選択できる
    */
    printHand(isOpen) {
        let card = new Card();
        console.log("[" + this.name + "の手札]");
        if (!isOpen) {
            for (let index in this.hand) {
                if (index == 0) {
                    console.log("＊＊＊");
                }
                else {
                    card = this.hand[index];
                    console.log(card.getStrName());
                }
            }
        }
        else {
            for (card of this.hand) {
                console.log(card.getStrName());
            }
            console.log("点数：" + this.getStrPoint());
        }
        splitLine();
        return;
    }
    /*
    * ディーラーがデッキからカードを引く
    * 手札の合計得点が17点以上になるまでカードを引き続ける
    */
    drawCard() {
        this.printHand(true);
        let card = new Card();
        while (this.getIntPoint() < 17) {
            console.log("ディーラーの点数は17未満なのでカードを引きます");
            card = this.deck.drawCard();
            this.hand.push(card);
            console.log("ディーラーが引いたカード：" + card.getStrName());
            splitLine();
            this.printHand(true);
        }
    }
}

function splitLine() {
    console.log("-----");
    return;
}

/*
* コンソールからの入力を受け取る関数
*/
function readUserInput(question) {
    process.stdin.setEncoding("utf8");
    const reader = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve, reject) => {
        reader.question(question, (answer) => {
            resolve(answer);
            reader.close();
        });
    });
}

/* メイン関数 */
(async function () {
    /* デッキの作成 */
    let deck = new Deck();
    deck.createDeck();

    /* ディーラーの手札を1枚隠して表示 */
    let dealer = new Dealer(deck);
    dealer.printHand(false);

    /* ユーザーの手番処理 */
    let user = new User(deck);
    console.log("★ユーザーの手番★")
    splitLine();
    await user.drawCard();

    /* ディーラーの手番処理 */
    console.log("★ディーラーの手番★");
    splitLine();
    dealer.drawCard();

    /* ユーザー、ディーラーの手札の合計得点表示 */
    console.log("ユーザーの点数　：" + user.getStrPoint());
    console.log("ディーラーの点数：" + dealer.getStrPoint());
    splitLine();
    
    /* 勝敗判定 */
    isBurstUser = user.isBurst();
    isBurstDealer = dealer.isBurst();
    if (isBurstUser && isBurstDealer) {
        console.log("双方バースト");
    }
    if (!isBurstUser && isBurstDealer) {
        console.log("ユーザーの勝ち");
    }
    if (isBurstUser && !isBurstDealer) {
        console.log("ディーラーの勝ち");
    }
    if (!isBurstUser && !isBurstDealer) {
        if (user.getIntPoint() > dealer.getIntPoint()) {
            console.log("ユーザーの勝ち");
        }
        else {
            console.log("ディーラーの勝ち");
        }
    }
})();

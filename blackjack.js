class Card {
    constructor(mark, no) {
        this.mark = mark;
        this.no = no;
    }
    getStrMark() {
        return this.mark;
    }
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
    getStrName() {
        return this.mark + "の" + this.getStrNo();
    }
    getIntPoint() {
        let point;
        if ((this.no == 11) || (this.no == 12) || (this.no == 13)) {
            point = 10;
        }
        else {
            point = this.no;
        }
        return point;
    }
}

class Deck {
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
    drawCard() {
        return this.deck.pop();
    }
}


class Player {
    constructor(deck){
        this.deck = deck;
        this.hand = [];
        for (let i = 0; i < 2; i++) {
            this.hand.push(this.deck.drawCard());
        }
    }
    getIntPoint() {
        let point = 0;
        for (let card of this.hand) {
            point = point + card.getIntPoint();
        }
        return point;
    }
    getStrPoint() {
        let point = this.getIntPoint();
        let str = String(point);
        if (point > 21) {
            str = str + "(バースト)";
        }
        return str;
    }
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


class User extends Player {
    constructor (deck) {
        super(deck);
        this.name = "ユーザー";
    }
    printHand() {
        console.log("[" + this.name + "の手札]");
        for (let card of this.hand) {
            console.log(card.getStrName());
        }
        console.log("点数：" + this.getStrPoint());
        splitLine();
        return;
    }
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

class Dealer extends Player {
    constructor (deck) {
        super(deck);
        this.name = "ディーラー";
    }
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

async function main() {
    let deck = new Deck();
    deck.createDeck();

    let dealer = new Dealer(deck);
    dealer.printHand(false);

    let user = new User(deck);
    console.log("★ユーザーの手番★")
    splitLine();
    await user.drawCard();

    console.log("★ディーラーの手番★");
    splitLine();
    dealer.drawCard();

    console.log("ユーザーの点数　：" + user.getStrPoint());
    console.log("ディーラーの点数：" + dealer.getStrPoint());
    splitLine();
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
}

main();
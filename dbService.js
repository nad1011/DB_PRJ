const mysql = require('mysql');
const dotenv = require('dotenv');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'dan10112003', 
    database: 'user',
});
connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    // console.log('db ' + connection.state);
});

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async getAllProduct() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM product;";
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getProduct(id) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM product WHERE id = ?;";
                connection.query(query, [id], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result);
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async getAllCart(username) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query1 = "SELECT * FROM user_infor WHERE username = ?"
                connection.query(query1, [username] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    const query = "SELECT * FROM cart WHERE userID = ?;";
                    connection.query(query, [result[0]['id']] ,(err, results) => {
                        if (err) reject(new Error(err.message));
                        resolve(results);
                    })
                })
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }

    async insertNewUser(username,email,password) {
        try {
            const insertId = await new Promise((resolve, reject) => {
                const query1 = "SELECT * FROM user_infor WHERE username = ?"
                connection.query(query1, [username] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    if (Object.keys(result).length != 0) {
                        resolve(-1);
                    } else {
                        const query2 = "INSERT INTO user_infor (username, email, password) VALUES (?,?,?);";
                        connection.query(query2, [username,email,password] , (err1, result1) => {
                            if (err1) reject(new Error(err1.message));
                            resolve(result1.id);
                        })
                    }
                })
            });
            if (insertId == -1) return null; 
            else return {
                id : insertId,
                username : username,
                email : email,
                password : password
            };
        } catch (error) {
            console.log(error);
        }
    }

    async insertNewProduct(name, price, image, sellerUsername, quantity) {
        try {
            const insertId = await new Promise((resolve, reject) => {
                const query1 = "SELECT * FROM user_infor WHERE username = ?"
                connection.query(query1, [sellerUsername] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    const query2 = "INSERT INTO product (name, img, price, sellerID, quantity) VALUES (?,?,?,?,?);";
                    connection.query(query2, [name,image,price,result[0].id,quantity] , (err1, result1) => {
                        if (err1) reject(new Error(err1.message));
                        resolve(result1.id);
                    })
                })
            });
            return {
                id : insertId
            };
        } catch (error) {
            console.log(error);
        }
    }

    async userLogin(username,password) {
        try {
            const insertId = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM user_infor WHERE username = ?";
                connection.query(query, [username] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    if (Object.keys(result).length == 0) {
                        resolve(-1);
                    }
                    else {
                        if (result[0].password != password) resolve(-1);
                        else resolve(result.id);
                    }
                })
            });
            if (insertId == -1) return null; 
            else return {
                id : insertId,
                username : username,
                password : password
            };
        } catch (error) {
            console.log(error);
        }
    }

    async insertNewCart(name, amount, price, username) {
        try {
            const insertId = await new Promise((resolve, reject) => {
                const query1 = "SELECT MAX(orderID) FROM cart";
                var orderID;
                var userID;
                var productID;
                connection.query(query1, (err, result) => {
                    if (err) reject(new Error(err.message));
                    if (result[0]['MAX(orderID)']==null) {
                        orderID = 1;
                    } else {
                        orderID = result[0]['MAX(orderID)'];
                    }
                    const query2 = "SELECT * FROM user_infor WHERE username = ?"
                    connection.query(query2, [username] , (err1, result1) => {
                        if (err1) reject(new Error(err1.message));
                        userID = result1[0]['id'];
                    })
                    const query3 = "SELECT * FROM product WHERE name = ?"
                    connection.query(query3, [name] , (err2, result2) => {
                        if (err2) reject(new Error(err2.message));
                        productID = result2[0]['id'];
                        const query4 = "INSERT INTO cart (orderID, userID, productID, amount, price) VALUES (?,?,?,?,?);";
                        connection.query(query4, [orderID,userID,productID,amount,price] , (err3, result3) => {
                            if (err3) reject(new Error(err3.message));
                            resolve(result3.cartID);
                        })
                    })
                })
            });
            return {
                id : insertId
            };
        } catch (error) {
            console.log(error);
        }
    }

    async deleteRowById(id) {
        try {
            id = parseInt(id, 10); 
            const response = await new Promise((resolve, reject) => {
                const query = "DELETE FROM names WHERE id = ?";
    
                connection.query(query, [id] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                })
            });
    
            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async updateNameById(id, name) {
        try {
            id = parseInt(id, 10); 
            const response = await new Promise((resolve, reject) => {
                const query = "UPDATE names SET name = ? WHERE id = ?";
    
                connection.query(query, [name, id] , (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                })
            });
    
            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async searchByName(name) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM names WHERE name = ?;";

                connection.query(query, [name], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });

            return response;
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = DbService;
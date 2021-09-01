import express from "express";
import { v4 as  uuidv4 } from 'uuid'

const app = express();


app.use(express.json())
const customers = [];



// Midleware

function verifyExistAccountCPF(request, response, next){
const { cpf } = request.headers;

const customer = customers.find((customer) => customer.cpf === cpf);

if (!customer) {
  return response.status(400).json({ error: 'Custumer not found' });
}
request.customer = customer;


return next();


}
function getBalance( statement){
  statement.reduce((acc, operation)=>{
    if(operation.type === 'credit'){
      return acc + operation.amount;

    }else{
      return acc - operation.amount
    }
  })
}


app.post('/accounts', (request, response)=>{
  const { cpf, name } = request.body;


  const customerAreadyExists = customers.some((customer)=> customer.cpf === cpf);
  if(customerAreadyExists) { 
    return response.status(400).json({error : 'Custumer already exists'});
  }

  customers.push({
    cpf: cpf,
    name: name,
    id: uuidv4(),
    statement: [],
  });
  return response.status(201).send();
  
})


app.get('/statements', verifyExistAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});


app.post('/deposits', verifyExistAccountCPF, (request, response) => {
const { description, amount } = request.body
const { customer} = request;
const statementOption = {
  description,
  amount,
  created_at: new Date(),
  type: 'credit',
};

customer.statement.push(statementOption);

return response.status(201).send();


});


app.post("/withdraw", verifyExistAccountCPF, (request, response)=>{
  const { amount } = request.body;
  const { customer } = request;
  const balance = getBalance(customer.statement);

  if(balance < amount ){
    return response.status(400).json({error: 'Insufficient founds!'});
  }

  const statementOption = {
    amount,
    created_at: new Date(),
    type: 'debit',
  };

  customer.statement.push(statementOption);


  return response.status(201).send();
})
app.listen(3333);
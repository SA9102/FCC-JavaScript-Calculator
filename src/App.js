import { useState } from "react";
import Button from "./components/Button";

import "./scss/App.css";

const operatorPrecedence = {
  "/": 3,
  "*": 3,
  "+": 2,
  "-": 2,
  "=": 1,
};

const operators = "/*+-";

export default function App() {
  // The current calculation to be performed, with each value separated by a space.
  // This gets filled every time the user presses a button on the calculator.
  const [calculation, setCalculation] = useState("0");
  const [operatorStack, setOperatorStack] = useState("");
  const [postfix, setPostfix] = useState("");
  // This is the result of a calculation
  const [res, setRes] = useState(0);
  // A boolean value which is set to true if a calculation has been complete.
  // This is so that, when the user then presses an operator, the calculation
  // can continue from this result.
  const [continueCalculation, setContinueCalculation] = useState(false);

  const [hasDecimal, setHasDecimal] = useState(false);
  // If the current number being entered is a negative number
  const [isNegative, setIsNegative] = useState(false);

  const handleAddToCalculation = (value, isOperator) => {
    let calculationCopy = String(calculation).slice();

    if (calculationCopy.split(" ").join("").length <= 18) {
      // If the user pressed an operator
      if (isOperator) {
        // If the previous two values are operators (this can only happen if the second
        // operator is a minus sign).
        if (
          operators.includes(calculationCopy[calculationCopy.length - 1]) &&
          operators.includes(calculationCopy[calculationCopy.length - 3])
        ) {
          // If the operator pressed is not a minus sign, then replace the previous two operators
          // with the operator that was pressed.
          if (value != "-") {
            calculationCopy = calculationCopy.slice(
              0,
              calculationCopy.length - 4
            );
            calculationCopy += ` ${value}`;
            setIsNegative(false);
          }
          // Otherwise, if only the previous value is an operator
        } else if (
          operators.includes(calculationCopy[calculationCopy.length - 1])
        ) {
          // If the operator pressed is a minus sign, then the next values that are typed in will
          // be negative, so we can append the minus sign to the previous operator
          if (value == "-") {
            calculationCopy += " -";
            setIsNegative(true);
            // If the operator pressed is not a minus sign, then replace the previous operator with
            // the operator that was pressed on.
          } else {
            calculationCopy = calculationCopy.slice(
              0,
              calculationCopy.length - 2
            );
            calculationCopy += ` ${value}`;
          }
          // continueCalculation is t
        } else if (continueCalculation) {
          calculationCopy = res + ` ${value}`;
          setContinueCalculation(false);
        } else {
          calculationCopy += ` ${value}`;
        }
      } else {
        console.log(isNegative);
        if (continueCalculation) {
          calculationCopy = "0";
        }

        // If this is the first value after an operator
        if (operators.includes(calculationCopy[calculationCopy.length - 1])) {
          console.log("OKAY");
          if (!isNegative) {
            if (value == "0") {
              calculationCopy += " 0";
            } else if (value == ".") {
              calculationCopy += " 0.";
            } else {
              calculationCopy += ` ${value}`;
            }
          } else {
            if (value == "0") {
              calculationCopy += "0";
            } else if (value == ".") {
              calculationCopy += "0.";
            } else {
              calculationCopy += `${value}`;
            }
          }
          // If we are adding more numbers to the current number
        } else {
          let split = calculationCopy.split(" ");
          let lastNum = split[split.length - 1];
          console.log(`SPLIT: ${split}`);
          console.log(`LAST NUM: ${lastNum}`);

          if (lastNum == "0") {
            if (value == ".") {
              split[split.length - 1] = "0.";
              calculationCopy = split.join(" ");
            } else if (value != "0") {
              if (split.length === 1) {
                calculationCopy = `${value}`;
              } else {
                split[split.length - 1] = `${value}`;
                calculationCopy = split.join(" ");
              }
            }
            // If we are adding a value right after a decimal
          } else if (lastNum[lastNum.length - 1] == ".") {
            if (value != ".") {
              calculationCopy += `${value}`;
            }
          } else if (value == ".") {
            if (!lastNum.includes(".")) {
              calculationCopy += ".";
            }
          } else {
            calculationCopy += `${value}`;
          }
        }
      }

      console.log(calculationCopy);
      setCalculation(calculationCopy);
      setContinueCalculation(false);
    }
  };

  const handleConvertToPostfix = () => {
    // Copy the calculation string, remove trailing whitespaces, then split it
    // where there are single spaces between the characters, resulting in an
    // array of operands and operators in the order in which they were typed.
    const calculationArray = calculation.slice().trim().split(" ");
    // This will contain the calculation in postfix form, except that each item
    // will be an operand or operator
    let postfix = [];
    let operatorStack = ["="];
    for (let i of calculationArray) {
      // If operand
      if (!operators.includes(i)) {
        postfix.push(i);
      } else {
        // If operator
        if (
          // If the current operator has higher priority than
          operatorPrecedence[i] >
          operatorPrecedence[operatorStack[operatorStack.length - 1]]
        ) {
          // Push this current operator to operatorStack
          operatorStack.push(i);
          // If the current operator's precedence is lower than or equal to the one at the top of the stack.
        } else {
          while (
            operatorPrecedence[operatorStack[operatorStack.length - 1]] >=
            operatorPrecedence[i]
          ) {
            // Pop the top operator and push it to pf stack.
            // It is possible that the operator that is now at the top of the stack still has lower
            // or equal precedence, so we need to remove this one as well. This happens iteratively
            // until the one at the top of the stac has higher priority.
            let operator = operatorStack.pop();
            postfix.push(operator);
          }
          // We push the current operator - that is, the one being looked at during the 'for'
          // iteration - to operatorStack.
          operatorStack.push(i);
        }
      }
    }
    // Once we have iterated through the calculation, we pop each item off operatorStack and push it
    // to the postfix array (the first operator to be popped will be pushed to postfix first, the second
    // operator will be second, etc).
    while (operatorStack.length > 1) {
      let operator = operatorStack.pop();
      postfix.push(operator);
    }
    // Finally, evaluate the result from the postfix notation.
    handleEvaluatePostfix(postfix);
  };

  // Perform the calculation from the postfix notation
  const handleEvaluatePostfix = (postfix) => {
    let values = postfix.slice();
    let secondNumIndex;
    while (values.length > 1) {
      for (let index in values) {
        // Reach the first operator
        if (operators.includes(values[index])) {
          secondNumIndex = index - 1;
          break;
        }
      }

      let secondNum = values[secondNumIndex];
      let firstNum = values[secondNumIndex - 1];
      let operator = values[secondNumIndex + 1];
      let result = 0;

      if (firstNum === undefined) {
        values = values[0];
        break;
      }

      if (operator === "+") {
        result = Number(firstNum) + Number(secondNum);
      } else if (operator === "-") {
        result = Number(firstNum) - Number(secondNum);
      } else if (operator === "*") {
        result = Number(firstNum) * Number(secondNum);
      } else if (operator === "/") {
        result = Number(firstNum) / Number(secondNum);
      }

      values = [
        ...values.slice(0, secondNumIndex - 1),
        String(result),
        ...values.slice(secondNumIndex + 2),
      ];
    }

    setCalculation(values[0]);
    setRes(values[0]);
    setIsNegative(false);
    setContinueCalculation(true);
  };
  // When DEL is pressed, remove the value that was just entered (either an operator or operand)
  const handleRemoveCurrentValue = () => {
    if (calculation[calculation.length - 1] === "-") {
      setIsNegative(false);
    }
    setCalculation(calculation.slice(0, calculation.length - 1).trim());
  };

  // When AC is pressed, clear the entire calculation.
  const handleClear = () => {
    setCalculation("0");
    setRes(0);
  };

  return (
    <>
      <div className="App">
        <div id="display">{calculation.split(" ").join("")}</div>
        <Button
          id="zero"
          className="number"
          value={0}
          onClick={handleAddToCalculation}
        />
        <Button
          id="one"
          className="number"
          value={1}
          onClick={handleAddToCalculation}
        />
        <Button
          id="two"
          className="number"
          value={2}
          onClick={handleAddToCalculation}
        />
        <Button
          id="three"
          className="number"
          value={3}
          onClick={handleAddToCalculation}
        />
        <Button
          id="four"
          className="number"
          value={4}
          onClick={handleAddToCalculation}
        />
        <Button
          id="five"
          className="number"
          value={5}
          onClick={handleAddToCalculation}
        />
        <Button
          id="six"
          className="number"
          value={6}
          onClick={handleAddToCalculation}
        />
        <Button
          id="seven"
          className="number"
          value={7}
          onClick={handleAddToCalculation}
        />
        <Button
          id="eight"
          className="number"
          value={8}
          onClick={handleAddToCalculation}
        />
        <Button
          id="nine"
          className="number"
          value={9}
          onClick={handleAddToCalculation}
        />
        <Button
          id="decimal"
          className="number"
          value={"."}
          onClick={handleAddToCalculation}
        />
        <Button
          id="add"
          className="operator"
          value={"+"}
          onClick={handleAddToCalculation}
        />
        <Button
          id="subtract"
          className="operator"
          value={"-"}
          onClick={handleAddToCalculation}
        />
        <Button
          id="multiply"
          className="operator"
          value={"*"}
          onClick={handleAddToCalculation}
        />
        <Button
          id="divide"
          className="operator"
          value={"/"}
          onClick={handleAddToCalculation}
        />
        <Button
          id="delete"
          className="delete"
          value={"DEL"}
          onClick={handleRemoveCurrentValue}
        />
        <Button
          id="clear"
          className="delete"
          value={"AC"}
          onClick={handleClear}
        />
        <button id="equals" onClick={handleConvertToPostfix}>
          =
        </button>
      </div>
      <p id="copyright">
        &copy; Shayan Ali (SA9102).
        <br />
        <a
          href="https://github.com/SA9102/FCC-JavaScript-Calculator"
          target="_blank"
        >
          View Repository
        </a>
      </p>
    </>
  );
}

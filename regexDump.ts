const regexA = /abc/g;

// A regex in a template literal
const regexB = /def/g;
const templateLiteral = `This is a template literal with a regex ${regexB}`;

// A regex in an object property
const objWithRegex = {
  regexC: /ghi/g,
};

// A regex in a function parameter with a default value
function regexed(defaultRegex = /who(is)?letting* the \. dogs out/g) {
  console.log(defaultRegex);
}

// A regex in a ternary operator
const regexD = /jkl/g;
const ternaryRegex = true ? regexD : /mno/g;

// A regex in a try-catch block
try {
  const regexE = /pqr/g;
} catch (e) {
  const regexF = /stu/g;
}

// A regex in a nested function
function outerFunction() {
  function innerFunction() {
    const regexG = /vwx/g;
  }
}

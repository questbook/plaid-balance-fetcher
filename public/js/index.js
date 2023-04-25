const checkConnectedStatus = async function () {
	try {
		const connectedResponse = await fetch(`/api/is_user_connected`);
		const connectedData = await connectedResponse.json();
		console.log(JSON.stringify(connectedData));
		if (connectedData.status === true) {
			document.querySelector("#connectedUI").classList.remove("hidden");
			showInstitutionName();
			showBalanceSum();
		} else {
			document
				.querySelector("#disconnectedUI")
				.classList.remove("hidden");
		}
	} catch (error) {
		console.error(`We encountered an error: ${error}`);
	}
};

const showBalanceSum = async function () {
	document.querySelector("#getBalance").disabled = true;

	const balance = await getBalance();
	document.querySelector(
		"#output"
	).textContent = `Your balance is ${JSON.stringify(balance)} USD`;
};

const getBalance = async function () {
	const balanceData = await fetch("/api/balance");
	const balanceJSON = await balanceData.json();
	console.log(balanceJSON);
	const balance = balanceJSON.accounts.reduce(
		(curSum, account) => account.balances.current + curSum,
		0
	);

  return balance;
};

/**
 *
 * @returns an object mapping each iso currency code to the sum of available balance.
 */
const getBalanceMulti = async function () {
	const balanceData = await fetch("/api/balance");
	const balanceJSON = await balanceData.json();
	console.log(balanceJSON);
	const balanceSumByCurrency = balanceJSON.accounts.reduce(
		(curObject, account) => {
			const prevBalance =
				curObject[account.balances.iso_currency_code] || 0;
			return {
				...curObject,
				[account.balances.iso_currency_code]:
					prevBalance + account.balances.current,
			};
		},
		{}
	);

	return balanceSumByCurrency;
};

const showInstitutionName = async function () {
	showBalanceSum();
	const bankData = await fetch("/api/get_bank_name");
	const bankJSON = await bankData.json();
	console.log(JSON.stringify(bankJSON));
	document.querySelector(
		"#connectDetails"
	).textContent = `You are connected to ${bankJSON.name ?? "Unknown"}! `;
};

// Grab a list of most recent transactions
const getTransactions = async function () {
	showBalanceSum();
	const transactionResponse = await fetch(`/api/transactions`);
	const transactionData = await transactionResponse.json();
	const simplifiedData = transactionData.transactions.map((item) => {
		return {
			date: item.date,
			name: item.name,
			amount: `$${item.amount.toFixed(2)}`,
			categories: item.category.join(", "),
		};
	});
	console.table(simplifiedData);
	document.querySelector("#output").textContent =
		JSON.stringify(simplifiedData);
};

document
	.querySelector("#getTransactions")
	.addEventListener("click", getTransactions);

document.querySelector("#getBalance").addEventListener("click", showBalanceSum);

checkConnectedStatus();

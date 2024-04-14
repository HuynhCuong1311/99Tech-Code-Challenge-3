import React, { useMemo } from "react";

// interface WalletBalance missing blockchain property
// balancePriority is never used in the useMemo function
// the lhsPriority is not defined
// in the sort function. It should be checked by priority first
// prices is never used inside the useMemo function dependencies.
// useMemo function is calling twice, which can be combined into a more efficient operation.
// the formattedBalances array is never used in the return statement.
// below is my refactored code.

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface WalletPageProps {
  children?: React.ReactNode;
}

const WalletPage: React.FC<WalletPageProps> = (props) => {
  const { children, ...rest } = props;

  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: string): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  const formattedBalances = useMemo(() => {
    const filteredAndSortedBalances = balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        return balancePriority > -99 && balance.amount <= 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        return rightPriority - leftPriority; // Sắp xếp theo giảm dần của priority
      })
      .map((balance: WalletBalance) => ({
        ...balance,
        formatted: balance.amount.toFixed(),
      }));

    return filteredAndSortedBalances;
  }, [balances, prices]);

  const renderRows = useMemo(() => {
    return formattedBalances.map(
      (balance: FormattedWalletBalance, index: number) => {
        const usdValue = prices[balance.currency] * balance.amount;
        return (
          <WalletRow
            className={classes.row}
            key={index}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      }
    );
  }, [formattedBalances, prices]);

  return <div {...rest}>{renderRows}</div>;
};

export default WalletPage;

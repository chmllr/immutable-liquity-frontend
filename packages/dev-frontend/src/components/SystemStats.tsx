import React from "react";
import { Card, Heading, Box, Text } from "theme-ui";
import { Decimal, Percent, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";

import { COIN, GT } from "../strings";
import { Statistic } from "./Statistic";

const selectBalances = ({ accountBalance, lusdBalance, lqtyBalance }: LiquityStoreState) => ({
  accountBalance,
  lusdBalance,
  lqtyBalance
});

const Balances: React.FC = () => {
  const { accountBalance, lusdBalance, lqtyBalance } = useLiquitySelector(selectBalances);

  return (
    <Box sx={{ mb: 3 }}>
      <Heading>My Account Balances</Heading>
      <Statistic name="ETH"> {accountBalance.prettify(4)}</Statistic>
      <Statistic name={COIN}> {lusdBalance.prettify()}</Statistic>
      <Statistic name={GT}>{lqtyBalance.prettify()}</Statistic>
    </Box>
  );
};

type SystemStatsProps = {
  variant?: string;
  showBalances?: boolean;
};

const select = ({
  numberOfTroves,
  price,
  total,
  lusdInStabilityPool,
  borrowingRate,
  redemptionRate,
  totalStakedLQTY,
  frontend
}: LiquityStoreState) => ({
  numberOfTroves,
  price,
  total,
  lusdInStabilityPool,
  borrowingRate,
  redemptionRate,
  totalStakedLQTY,
  kickbackRate: frontend.status === "registered" ? frontend.kickbackRate : null
});

export const SystemStats: React.FC<SystemStatsProps> = ({ variant = "info", showBalances }) => {

  const {
    numberOfTroves,
    price,
    lusdInStabilityPool,
    total,
    borrowingRate,
    totalStakedLQTY,
  } = useLiquitySelector(select);

  const lusdInStabilityPoolPct =
    total.debt.nonZero && new Percent(lusdInStabilityPool.div(total.debt));
  const totalCollateralRatioPct = new Percent(total.collateralRatio(price));
  const borrowingFeePct = new Percent(borrowingRate);

  return (
    <Card {...{ variant }}>
      {showBalances && <Balances />}

      <Heading>Liquity statistics</Heading>

      <Heading as="h2" sx={{ mt: 3, fontWeight: "body" }}>
        Protocol
      </Heading>

      <Statistic
        name="Borrowing Fee"
        tooltip="The Borrowing Fee is a one-off fee charged as a percentage of the borrowed amount (in LUSD) and is part of a Trove's debt. The fee varies between 0.5% and 5% depending on LUSD redemption volumes."
      >
        {borrowingFeePct.toString(2)}
      </Statistic>

      <Statistic
        name="TVL"
        tooltip="The Total Value Locked (TVL) is the total value of Ether locked as collateral in the system, given in ETH and USD."
      >
        {total.collateral.shorten()} <Text sx={{ fontSize: 1 }}>&nbsp;ETH</Text>
        <Text sx={{ fontSize: 1 }}>
          &nbsp;(${Decimal.from(total.collateral.mul(price)).shorten()})
        </Text>
      </Statistic>
      <Statistic name="Troves" tooltip="The total number of active Troves in the system.">
        {Decimal.from(numberOfTroves).prettify(0)}
      </Statistic>
      <Statistic name="LUSD supply" tooltip="The total LUSD minted by the Liquity Protocol.">
        {total.debt.shorten()}
      </Statistic>
      {lusdInStabilityPoolPct && (
        <Statistic
          name="LUSD in Stability Pool"
          tooltip="The total LUSD currently held in the Stability Pool, expressed as an amount and a fraction of the LUSD supply.
        "
        >
          {lusdInStabilityPool.shorten()}
          <Text sx={{ fontSize: 1 }}>&nbsp;({lusdInStabilityPoolPct.toString(1)})</Text>
        </Statistic>
      )}
      <Statistic
        name="Staked LQTY"
        tooltip="The total amount of LQTY that is staked for earning fee revenue."
      >
        {totalStakedLQTY.shorten()}
      </Statistic>
      <Statistic
        name="Total Collateral Ratio"
        tooltip="The ratio of the Dollar value of the entire system collateral at the current ETH:USD price, to the entire system debt."
      >
        {totalCollateralRatioPct.prettify()}
      </Statistic>
      <Statistic
        name="Recovery Mode"
        tooltip="Recovery Mode is activated when the Total Collateral Ratio (TCR) falls below 150%. When active, your Trove can be liquidated if its collateral ratio is below the TCR. The maximum collateral you can lose from liquidation is capped at 110% of your Trove's debt. Operations are also restricted that would negatively impact the TCR."
      >
        {total.collateralRatioIsBelowCritical(price) ? <Box color="danger">Yes</Box> : "No"}
      </Statistic>
      {}

    </Card>
  );
};

import CountUp from "react-countup";

const CountUpNumber = ({
  value = 0,
  prefix = "",
  suffix = "",
  decimals = 0,
  separator = ",",
  duration = 2,
  className = "",
}) => {
  return (
    <span className={className}>
      <CountUp
        end={Number(value) || 0}
        duration={duration}
        separator={separator}
        decimals={decimals}
        prefix={prefix}
        suffix={suffix}
        enableScrollSpy
        scrollSpyOnce
      />
    </span>
  );
};

export default CountUpNumber;

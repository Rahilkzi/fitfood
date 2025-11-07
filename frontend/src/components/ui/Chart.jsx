import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { name: "Jan", value: 40 },
  { name: "Feb", value: 80 },
  { name: "Mar", value: 65 },
];

const config = {
  value: { label: "Sales", color: "#10b981" },
};

export default function ExampleChart() {
  return (
    <ChartContainer config={config}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='name' />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type='monotone'
          dataKey='value'
          stroke='var(--color-value)'
          strokeWidth={2}
        />
        <ChartLegend content={<ChartLegendContent />} />
      </LineChart>
    </ChartContainer>
  );
}

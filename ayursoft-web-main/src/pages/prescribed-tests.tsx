import PriscripedTestsPage from "../components/prescribed-tests";
import { cn } from "../utils/cn";

function PrescribedTestsLayout() {
  return (
    <div className={"flex flex-column h-screen overflow-hidden"}>
      <div className={"flex grow"}>
        <div className={cn("grow non-selectable")}>
          <PriscripedTestsPage />
        </div>
      </div>
    </div>
  );
}

export default PrescribedTestsLayout;

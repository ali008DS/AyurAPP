import SearchPriscriptionPage from "../components/SearchPriscriptionPage";
import { cn } from "../utils/cn";

function SearchPriscriptionLayout() {
  return (
    <div className={"flex flex-column h-screen overflow-hidden"}>
      <div className={"flex grow"}>
        <div className={cn("grow non-selectable")}>
          <SearchPriscriptionPage onPatientSelect={() => {}} />
        </div>
      </div>
    </div>
  );
}

export default SearchPriscriptionLayout;

import { useState } from "react";
import CreateSale from "../../components/createSale/CreateSale";
import SalesList from "../../components/saleList/SaleList";

const SalePage = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div>
            <h1>Sale Page</h1>
            <CreateSale onSaleCreated={() => setRefreshTrigger(prev => prev+1)} />
            <SalesList refreshTrigger={refreshTrigger} />
        </div>
    );
}

export default SalePage;
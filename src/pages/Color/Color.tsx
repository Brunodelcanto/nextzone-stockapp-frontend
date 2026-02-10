import { useState } from "react";
import ColorList from "../../components/colorList/ColorList";
import CreateColor from "../../components/createColor/CreateColor";

const ColorPage = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    return (
        <div>
            <h1>Color Page</h1>
            <CreateColor onColorCreated={() => setRefreshTrigger(prev => prev + 1)} />
            <ColorList refreshTrigger={refreshTrigger} />
        </div>
    )
}

export default ColorPage;
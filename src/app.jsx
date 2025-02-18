import { useEffect, useState } from 'react';

function App() {
    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch('/getData');
            const result = await response.json();
            setData(result);
        }

        fetchData();
    }, []);

    return (
        <div>
            <h1>Restaurant Reviews</h1>
            <ul>
                {data.map((item) => (
                    <li key={item._id}>
                        {item.name} - {item.rating}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;

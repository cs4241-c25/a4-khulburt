import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
    const [formData, setFormData] = useState({
        name: '',
        foodtype: '',
        date: '',
        rating: '',
        review: ''
    });

    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            window.location.href = '/loginPage.html'; // or use React Router later
        } else {
            fetchData();
        }
    }, []);

    const fetchData = async () => {
        const user = localStorage.getItem('user');
        try {
            const response = await axios.get(`/getData?username=${user}`);
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = localStorage.getItem('user');

        const payload = {
            ...formData,
            username: user,
        };

        try {
            const response = await axios.post('/submit', payload);
            setReviews(response.data);
            setFormData({ name: '', foodtype: '', date: '', rating: '', review: '' });
        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };

    const handleClear = async () => {
        const user = localStorage.getItem('user');
        try {
            await axios.post('/clear', { username: user });
            setReviews([]);
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <h1>Restaurant Reviews</h1>

            <form onSubmit={handleSubmit} id="restaurantForm">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Restaurant Name" required />
                <input name="foodtype" value={formData.foodtype} onChange={handleChange} placeholder="Food Type" required />
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                <input type="number" name="rating" value={formData.rating} onChange={handleChange} min="0" max="10" required />
                <textarea name="review" value={formData.review} onChange={handleChange} placeholder="Review" required />

                <button type="submit">Submit Review</button>
            </form>

            <button onClick={handleClear}>Clear Data</button>
            <button onClick={fetchData}>Refresh Data</button>

            <button onClick={() => (window.location.href = 'http://localhost:3000/auth/github')}>
                Login with GitHub
            </button>

            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Food Type</th>
                    <th>Date</th>
                    <th>Rating</th>
                    <th>Review</th>
                    <th>Would Return?</th>
                </tr>
                </thead>
                <tbody>
                {reviews.map((item, index) => (
                    <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.foodtype}</td>
                        <td>{item.date}</td>
                        <td>{item.rating}</td>
                        <td>{item.review}</td>
                        <td>{item.rating > 5 ? 'Yes' : 'No'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;

import React, { useEffect } from 'react'

const Signin = () => {

    const fetchUsers = async () => {
        const url = `http://localhost:8000/api/user/`;
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            })

            if (!response.ok) throw new Error(`Response status: ${response.status}`);

            const json = await response.json();
            console.log(json);
        } catch (error) {
            console.log(`Error fetching users: ${error}`);
        }
    }

    fetchUsers();

    return (
        <div>Signin</div>
    )
}

export default Signin
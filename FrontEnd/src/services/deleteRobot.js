const deleteRobot = {

    createDeleteRobot(deleteArray, username) {

        const createDeleteRobotOption = {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deleteArray)
        }

        return fetch('/api/tasks/' + username + '/delete', createDeleteRobotOption).then(answer => {
            if (!answer.ok) { throw answer }
            return answer.text()
        }).catch(error => {
            throw error
        })
    }
}

export default deleteRobot
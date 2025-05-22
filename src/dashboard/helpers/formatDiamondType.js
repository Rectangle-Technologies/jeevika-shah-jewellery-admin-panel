exports.formatDiamondType = (type) => {
    switch (type) {
        case 'natural':
            return 'Natural';
        case 'lab-grown':
            return 'Lab Grown';
        default:
            return 'Unknown';
    }
};
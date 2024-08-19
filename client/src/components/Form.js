
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import PDFGenerator from './PDFGenerator';

const Form = () => {
  const [formData, setFormData] = useState({
    date: '',
    firmName: '',
    numberOfPartners: 1,
    partners: [{ name: '', sonOf: '', aadharNo: '', capital: 0, profitShare: 0, salary: 0, address: '' }],
    businessActivity: '',
    businessAddress: '',
    numberOfSignatories: 1,
    signatories: []
  });

  const [partnerOptions, setPartnerOptions] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Update partner options for signatories select
  useEffect(() => {
    const options = formData.partners.map((partner, index) => ({
      value: partner.name,
      label: partner.name
    }));
    setPartnerOptions(options);
  }, [formData.partners]);
  

  // Check if the combined profit share exceeds 100%
  useEffect(() => {
    const totalShare = formData.partners.reduce((sum, partner) => sum + parseFloat(partner.profitShare || 0), 0);
    if (totalShare > 100) {
      setErrorMessage('The total profit share cannot exceed 100%');
    } else {
      setErrorMessage('');
    }
  }, [formData.partners]);
  //iso to string
  // Format date to "yyyy-MM-dd"
  const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = new Date(date).toLocaleDateString('en-CA', options); // 'en-CA' gives format 'yyyy-MM-dd'
    return formattedDate;
};
  //query for dd
  const fetchSearchResults = async (query = '') => {
    setLoading(true);
    try {
      const response = await fetch(`https://partnership-deed.onrender.com/api/searchPartnershipDeeds?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      // Convert dates to "yyyy-MM-dd" format
      const options = data.map(deed => ({
        value: deed._id,
        label: deed.firmName,
        date: formatDate(deed.date) // Assuming you need to convert and use the date
        
      }));
  
      setSearchResults(options);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };
  

// Call fetchSearchResults with an empty string or a default query
useEffect(() => {
  fetchSearchResults(); // Or provide a specific query if needed
}, []);

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
//here partner changes 
const handleNumberOfPartnersChange = (e) => {
  const newNumberOfPartners = parseInt(e.target.value, 10);

  // Ensure the new number of partners is valid
  if (newNumberOfPartners < 0) return;

  // Preserve existing data and manage the new partners list
  const newPartners = [...formData.partners];
  const currentNumberOfPartners = newPartners.length;

  if (newNumberOfPartners > currentNumberOfPartners) {
    // Add new partners with default values
    for (let i = currentNumberOfPartners; i < newNumberOfPartners; i++) {
      newPartners.push({
        name: '',
        sonOf: '',
        aadharNo: '',
        capital: 0,
        profitShare: 0,
        salary: 0,
        address: ''
      });
    }
  } else if (newNumberOfPartners < currentNumberOfPartners) {
    // Remove excess partners while preserving existing data
    newPartners.splice(newNumberOfPartners);
  }

  setFormData(prev => ({
    ...prev,
    numberOfPartners: newNumberOfPartners,
    partners: newPartners
  }));
};
//
  const handlePartnerChange = (index, e) => {
    const { name, value } = e.target;
    const newPartners = [...formData.partners];
  
    // Update specific partner field
    newPartners[index] = { ...newPartners[index], [name]: value };
  
    // Recalculate salary based on updated profitShare or totalProfit
    if (name === 'profitShare' || name === 'totalProfit') {
      const totalProfit = parseFloat(formData.totalProfit) || 0;
      newPartners.forEach(partner => {
        if (partner.profitShare) {
          partner.salary = (totalProfit * (partner.profitShare / 100)).toFixed(2);
        }
      });
    }
  
    // Update signatories list if needed
    const newSignatories = newPartners.map(partner => partner.name);
  
    setFormData(prev => ({
      ...prev,
      partners: newPartners,
      signatories: newSignatories
    }));
  };
  
  




  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    PDFGenerator(formData);
  };

  // Handle signatories change
  const handleSignatoriesChange = (selectedOptions) => {
    const maxSignatories = parseInt(formData.numberOfSignatories, 10);
    
    if (selectedOptions.length <= maxSignatories) {
      setFormData(prev => ({
        ...prev,
        signatories: selectedOptions.map(option => option.value)
      }));
    }
  };

  // Handle preview button click
  const handlePreviewData = () => {
    setShowTable(true);
  };

  const handleSubmitToAPI = async () => {
    try {
        const response = await fetch('https://partnership-deed.onrender.com/api/partnership-deed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        // Check if the response content type is JSON
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            if (response.ok) {
                console.log('API Response:', result);
                alert('Partnership deed successfully saved or updated!');
            } else {
                console.error('API Error:', result);
                alert('Failed to save or update partnership deed');
            }
        } else {
            // Handle non-JSON response
            const text = await response.text();
            console.error('Unexpected response format:', text);
            alert('Unexpected response format from server');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving or updating the partnership deed');
    }
};

  
  // Handle selecting a partnership deed

  const handleSelectPartnershipDeed = async (selectedOption) => {
    console.log('Selected option:', selectedOption); // Log the selected option
    if (selectedOption) {
        try {
            const response = await fetch(`https://partnership-deed.onrender.com/api/partnership-deed/${selectedOption.value}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setFormData({
                ...data,
                date: formatDate(data.date),
                partners: data.partners || [{ name: '', sonOf: '', aadharNo: '', capital: 0, profitShare: 0, salary: 0, address: '' }]
            });
        } catch (error) {
            console.error('Error fetching partnership deed:', error);
        }
    } else {
        console.warn('Selected option value is undefined or empty');
    }
};



  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen ">    
      <h1 className="text-3xl font-extrabold text-center text-blue-600 mb-6 hover:scale-125 transition delay-150 duration-300 ease-in-out">Partnership Deed</h1>  
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-2xl">
        <div className="mb-4">
        <div className="mb-4">
        <label className="block text-gray-700 text-lg font-medium mb-2">Select Partnership Deed</label>
        <Select
            options={searchResults}
            isLoading={loading}
            className="basic-single "
            classNamePrefix="select"
            placeholder="Select a partnership deed"
            onChange={handleSelectPartnershipDeed}
          />
      </div>

          <label className="block text-gray-700 text-lg font-medium mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-lg font-medium mb-2">Firm Name</label>
          <input
            type="text"
            name="firmName"
            value={formData.firmName}
            onChange={handleInputChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-lg font-medium mb-2">Number of Partners</label>
          <input
            type="number"
            name="numberOfPartners"
            value={formData.numberOfPartners}
            onChange={handleNumberOfPartnersChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>
        {/* <div className="mb-4">
          <label className="block text-gray-700 text-lg font-medium mb-2">Total Profit</label>
          <input
            type="number"
            name="totalProfit"
            value={formData.totalProfit}
            onChange={handleInputChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div> */}
        {formData.partners.map((partner, index) => (
          <div key={index} className="border border-gray-300 p-6 mb-4 rounded-lg bg-gray-50 shadow-sm">
            <h2 className="text-2xl font-semibold" text-gray-800 mb-4>Partner {index + 1}</h2>
            <div className="mb-2">
              <label className="block text-gray-700 text-lg font-medium mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={partner.name}
                onChange={(e) => handlePartnerChange(index, e)}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 text-lg font-medium mb-2">Son/Daughter of</label>
              <input
                type="text"
                name="sonOf"
                value={partner.sonOf}
                onChange={(e) => handlePartnerChange(index, e)}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 text-lg font-medium mb-2">Aadhar Number</label>
              <input
                type="text"
                name="aadharNo"
                value={partner.aadharNo}
                onChange={(e) => handlePartnerChange(index, e)}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 text-lg font-medium mb-2">Initial Capital Contribution</label>
              <input
                type="number"
                name="capital"
                value={partner.capital}
                onChange={(e) => handlePartnerChange(index, e)}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 text-lg font-medium mb-2">Profit Sharing Percentage</label>
              <input
                type="number"
                name="profitShare"
                value={partner.profitShare}
                onChange={(e) => handlePartnerChange(index, e)}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 text-lg font-medium mb-2">Salary</label>
              <input
                type="number"
                name="salary"
                value={partner.salary}
                onChange={(e) => handlePartnerChange(index, e)}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                required
              />
              </div>
            <div className="mb-2">
              <label className="block text-gray-700 text-lg font-medium mb-2">Residential Address</label>
              <input
                type="text"
                name="address"
                value={partner.address}
                onChange={(e) => handlePartnerChange(index, e)}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        ))}
        <div className="mb-4">
          <label className="block text-gray-700 text-lg font-medium mb-2">Business Activity Description</label>
          <textarea
            name="businessActivity"
            value={formData.businessActivity}
            onChange={handleInputChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-lg font-medium mb-2">Business Address</label>
          <textarea
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleInputChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-lg font-medium mb-2">Number of Signatories</label>
          <input
            type="number"
            name="numberOfSignatories"
            value={formData.numberOfSignatories}
            onChange={handleInputChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>
        <div className="mb-4">
            <label className="block text-gray-700 text-lg font-medium mb-2">Select Signatories</label>
            <Select
                isMulti
                options={partnerOptions}
                onChange={handleSignatoriesChange}
                className="basic-single"
                classNamePrefix="select"
                value={partnerOptions.filter(option => formData.signatories.includes(option.value))}
                isDisabled={formData.signatories.length >= formData.numberOfSignatories}
            />
            <p className="text-sm text-gray-600 mt-1">
                You can select up to {formData.numberOfSignatories} signatories.
            </p>
        </div>
        <div className="flex justify-center items-center gap-8">
            <button type="submit" className="bg-blue-500  text-white p-3 rounded-lg shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Generate PDF
            </button>
            <button
              type="button"
              onClick={handleSubmitToAPI}
              className="bg-red-500 ml-4 text-white p-3 rounded-lg shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Save Data
            </button>
            <button
              type="button"
              onClick={handlePreviewData}
              className="bg-green-500 ml-4  text-white p-3 rounded-lg shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Preview Data
            </button>
            
        </div>
      </form>

      {showTable && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Partners Data</h2>
          {formData.partners.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2"></th>
                  {formData.partners.map((_, index) => (
                    <th key={index} className="border px-4 py-2">Partner {index + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['name', 'sonOf', 'aadharNo', 'capital', 'profitShare', 'salary', 'address'].map(field => (
                  <tr key={field}>
                    <td className="border px-4 py-2 font-bold">
                      {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </td>
                    {formData.partners.map((partner, index) => (
                      <td
                        key={index}
                        className="border border-gray-300 p-2 font-semibold"
                        style={{
                          wordWrap: 'break-word',
                          whiteSpace: 'normal', // Allow wrapping
                          maxWidth: '200px', // Set a max width for the cell
                        }}
                      >
                        {partner[field] || 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600">No partners data available.</p>
          )}
        </div>
      )}


    </div>
  );
};

export default Form;


